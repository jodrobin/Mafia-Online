# Here go your api methods.


def get_users():
    users = []

    for row in db(db.auth_user.id != auth.user.id).select():
        user = dict(
            username=row.username,
            id=row.id,
        )
        users.append(user)

    logged_in = auth.user is not None

    return response.json(dict(
        users=users,
        logged_in=logged_in,
        user_id=auth.user.id,
        user_username=auth.user.username,
    ))


def send_msg():
    t_id = db.chat.insert(
        msg=request.vars.msg,
        author=request.vars.author,
        the_time=request.vars.the_time,
    )

    return "ok"


def get_new_msgs():
    messages = []
    logger.info(request.vars.the_time)
    for row in db(db.chat.the_time >= request.vars.the_time).select():
        message = dict(
            msg=row.msg,
            author=row.author,
        )
        messages.append(message)

    logger.info(messages)
    return response.json(dict(
        messages=messages,
    ))
