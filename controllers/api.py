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

def get_ingame_players():
    players = []

    game_id = db(db.player.user_email == auth.user.email).select().first().current_game
    for row in db(db.player.current_game == game_id).select():
        player = dict(
            current_game=row.current_game,
            role=row.role,
            user_email=row.user_email,
            user_id=row.user_id,
            is_dead=row.is_dead,
            bio=row.bio,
            name=row.name
        )
        players.append(player)
    return response.json(dict(
        players=players)
    )

def swap_player_roles():
    return
