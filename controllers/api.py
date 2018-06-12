# Here go your api methods.


def get_users():
    import datetime
    limit = request.now - datetime.timedelta(minutes=30)
    query = db.auth_event.time_stamp > limit
    query &= db.auth_event.description.contains('Logged-')
    events = db(query).select(db.auth_event.user_id, db.auth_event.description,
                              orderby=db.auth_event.user_id | db.auth_event.time_stamp)
    users = []
    for i in range(len(events)):
        last_event = ((i == len(events) - 1) or
                      events[i + 1].user_id != events[i].user_id)
        if last_event and 'Logged-in' in events[i].description:
            users.append(events[i].user_id)

    logged_in_users = []
    for row in db(db.auth_user.id.belongs(users)).select():
        user = dict(
            username=row.username,
            id=row.id,
        )
        logged_in_users.append(user)

    logged_in = auth.user is not None

    return response.json(dict(
        users=logged_in_users,
        logged_in=logged_in,
        user_id=auth.user.id,
        user_username=auth.user.username,
    ))


def get_ingame_players():
    players = []
    game_id = db(db.player.user_email == auth.user.email).select().first().current_game
    is_leader = False

    for row in db(db.player.current_game == game_id).select():
        if row.user_email == auth.user.email:
            is_leader = row.leader

        player = dict(
            leader=row.leader,
            role=row.role,
            initial_role = row.initial_role,
            user_email=row.user_email,
            user_id=row.user_id,
            is_dead=row.is_dead,
            bio=row.bio,
            username=row.username
        )
        players.append(player)

    return response.json(dict(
        is_leader=is_leader,
        players=players,
        user_id=auth.user.id,
        user_username=auth.user.username,
        game_id=game_id,
    ))


def swap_player_roles():
    print request.vars.p1
    print request.vars.p2
    print request.vars.p2_role
    print request.vars.p1_role
    p1 = request.vars.p1
    p2 = request.vars.p2
    (db(db.player.user_id == p1).update(role=request.vars.p2_role))
    (db(db.player.user_id == p2).update(role=request.vars.p1_role))
    return

def cast_vote():
    p1 = request.vars.p1
    (db(db.player.user_id == p1).update(vote=request.vars.vote))


def update_player_info():
    row = db(db.player.user_email == auth.user.email).select().first()
    if row is None:
        id = db.player.insert(current_game=0)
    else:
        row.update_record(
            current_game=0
        )
    return "ok"


def update_users():
    import datetime
    limit = request.now - datetime.timedelta(minutes=30)
    query = db.auth_event.time_stamp > limit
    query &= db.auth_event.description.contains('Logged-')
    events = db(query).select(db.auth_event.user_id, db.auth_event.description,
                              orderby=db.auth_event.user_id | db.auth_event.time_stamp)
    users = []
    for i in range(len(events)):
        last_event = ((i == len(events) - 1) or
                      events[i + 1].user_id != events[i].user_id)
        if last_event and 'Logged-in' in events[i].description:
            users.append(events[i].user_id)

    logged_in_users = []
    for row in db(db.auth_user.id.belongs(users)).select():
        user = dict(
            username=row.username,
            id=row.id,
        )
        logged_in_users.append(user)

    return response.json(dict(
        users=logged_in_users,
    ))


def send_msg():
    t_id = db.chat.insert(
        msg=request.vars.msg,
        author=request.vars.author,
        the_time=request.vars.the_time,
        chat_id=request.vars.chat_id,
    )

    return "ok"


def get_new_msgs():
    messages = []
    for row in db((db.chat.the_time >= request.vars.the_time) & (db.chat.chat_id == request.vars.chat_id)).select():
        message = dict(
            msg=row.msg,
            author=row.author,
        )
        messages.append(message)

    return response.json(dict(
        messages=messages,
    ))


def add_game():
    t_id = db.game.insert(game_name=request.vars.new_game, is_public=request.vars.public_checked,
                          password=request.vars.new_pass)
    logger.info(t_id)
    row = db(db.player.user_id == request.vars.id).select().first()
    logger.info(row)
    if row is not None:
        row.update_record(
            current_game=t_id,
            leader=True,
        )

    return "ok"


def get_games(): 
    games = []

    for row in db((db.game.has_ended == 0) & (db.game.has_started == 0)).select(db.game.ALL):
        logger.info(row.has_started)
        g = dict(
            game_name=row.game_name,
            num_players=row.num_players,
            id=row.id,
            inputting_password=row.inputting_password,
            password=row.password,
            is_public=row.is_public,
        )
        games.append(g)

    return response.json(dict(games=games))


def start_game():
    row = db(db.game.id == request.vars.id).select().first()
    if row is not None:
        row.update_record(
            has_started=True
        )

    return "ok"


def cancel_game():
    row = db(db.game.id == request.vars.id).select().first()
    if row is not None:
        row.update_record(
            has_ended=True
        )

    return "ok"


def leave_game():
    row = db(db.player.user_id == request.vars.id).select().first()
    if row is not None:
        game_id = row.current_game
        row.update_record(
            current_game=0
        )
        game_row = db(db.game.id == game_id).select().first()
        if game_row.num_players == 1:
            game_row.update_record(
                has_ended=True
            )
        else:
            new_num_players = game_row.num_players - 1
            game_row.update_record(
                num_players=new_num_players
            )

    return "ok"


def check_game():
    row = db(db.game.id == request.vars.id).select().first()

    return response.json(dict(
        has_started=row.has_started,
        has_ended=row.has_ended
    ))


def join_game():
    player_row = db(db.player.user_id == request.vars.user_id).select().first()
    if player_row is not None:
        player_row.update_record(
            current_game=request.vars.game_id
        )

    game_row = db(db.game.id == request.vars.game_id).select().first()
    if game_row is not None:
        new_num_players = game_row.num_players + 1
        game_row.update_record(
            num_players=new_num_players
        )

    return "ok"


def ask_for_password():
    logger.info("ask for password")
    logger.info(request.vars.game_id)
    db(db.game.id != request.vars.game_id).update(inputting_password=False)
    db(db.game.id == request.vars.game_id).update(inputting_password=request.vars.toggle)

    return "ok"


def update_roles():
    player = request.vars.player
    (db(db.player.user_id == player).update(role=request.vars.role))
    (db(db.player.user_id == player).update(initial_role=request.vars.role))

    return

def get_votes():
    players = []
    game_id = db(db.player.user_email == auth.user.email).select().first().current_game

    for row in db(db.player.current_game == game_id).select():
        pid = row.user_id
        count = 0
        for row2 in db(db.player.current_game == game_id).select():
            if row2.vote == pid:
                count += 1

        player = dict(
            count=count,
            role=row.role,
        )
        players.append(player)
    return response.json(dict(
        players=players,
    ))


def get_game_id(): 
    game_id = db(db.player.user_email == auth.user.email).select().first().current_game
    return response.json(dict(game_id=game_id))

