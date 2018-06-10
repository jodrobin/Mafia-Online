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
    for row in db(db.player.current_game == game_id).select():
        player = dict(
            role=row.role,
            user_email=row.user_email,
            user_id=row.user_id,
            is_dead=row.is_dead,
            bio=row.bio,
            username=row.username
        )
        players.append(player)
    return response.json(dict(
        players=players,
        user_id=auth.user.id,
        user_username=auth.user.username,
        game_id=game_id,
    ))


def swap_player_roles():
    return


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
    logger.info(request.vars.id)
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
    db.game.insert(id=request.vars.new_game)
    return dict()

