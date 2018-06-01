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