# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.


def get_user_email():
    return auth.user.email if auth.user else None


def get_user_id():
    return auth.user.id if auth.user else None


def get_username():
    return auth.user.username if auth.user else None


db.define_table('player',
                Field('user_email', default=get_user_email()),
                Field('username', default=get_username()),
                Field('user_id', default=get_user_id()),
                Field('bio', 'text'),
                Field('current_game'),
                Field('role'),
                Field('is_dead', 'boolean', default=False),
                )


db.define_table('game',
				Field('game_name'),
                Field('num_players', default=1))



db.define_table('chat',
                Field('chat_id', 'integer'),
                Field('msg'),
                Field('author'),
                Field('the_time'))

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
