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
    logger.info("get ingame players")
    game_id = db(db.player.user_email == auth.user.email).select().first().current_game
    logger.info(game_id)

    for row in db(db.player.current_game == game_id).select():
        logger.info(game_id)
        player = dict(
            role=row.role,
            initial_role = row.initial_role,
            user_email=row.user_email,
            user_id=row.id,
            is_dead=row.is_dead,
            bio=row.bio,
            username=row.username
        )
        logger.info(player)
        players.append(player)
    logger.info(players)
    return response.json(dict(
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
    (db(db.player.id == p1).update(role=request.vars.p2_role))
    (db(db.player.id == p2).update(role=request.vars.p1_role))
    return


def update_player_info():
    row = db(db.player.user_email == auth.user.email).select().first()
    if row is None:
        id = db.player.insert()
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

    logger.info(logged_in_users)
    return response.json(dict(
        users=logged_in_users,
    ))


def send_msg():
    logger.info(request.vars.chat_id)
    t_id = db.chat.insert(
        msg=request.vars.msg,
        author=request.vars.author,
        the_time=request.vars.the_time,
        chat_id=request.vars.chat_id,
    )
    logger.info(t_id)

    return "ok"


def get_new_msgs():
    messages = []
    logger.info(request.vars.the_time)
    for row in db((db.chat.the_time >= request.vars.the_time) & (db.chat.chat_id == request.vars.chat_id)).select():
        message = dict(
            msg=row.msg,
            author=row.author,
        )
        messages.append(message)

    logger.info(messages)
    return response.json(dict(
        messages=messages,
    ))


def add_game():
    logger.info(request.vars.new_game)
    t_id = db.game.insert(game_name=request.vars.new_game)
    logger.info(t_id)

    row = db(db.player.id == request.vars.id).select().first()
    if row is not None:
        row.update_record(
            current_game=t_id,
        )

    return "ok"


def get_games(): 
    games = []
    for row in db(db.game.has_ended == 0).select(db.game.ALL):
        g = dict(
            game_name=row.game_name,
            num_players=row.num_players,
            id=row.id,
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
    row = db(db.player.id == request.vars.id).select().first()
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
            logger.info(game_row.num_players)
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
    logger.info("joining game")
    logger.info(request.vars.user_id)
    logger.info(request.vars.game_id)
    player_row = db(db.player.id == request.vars.user_id).select().first()
    if player_row is not None:
        logger.info("found user")
        player_row.update_record(
            current_game=request.vars.game_id
        )

    game_row = db(db.game.id == request.vars.game_id).select().first()
    if game_row is not None:
        logger.info("found game")
        new_num_players = game_row.num_players + 1
        logger.info(new_num_players)
        game_row.update_record(
            num_players=new_num_players
        )

    return "ok"
