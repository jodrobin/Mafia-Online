// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    Array.prototype.unique = function() {
        var a = this.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

    return a;
    };

    // Extends an array
    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.get_users = function () {
        $.getJSON(users_url, function (data) {
            self.vue.users = data.users;
            self.vue.logged_in = data.logged_in;
            self.vue.user_id = data.user_id;
            self.vue.user_username = data.user_username;
            self.update_player_info();
            self.update_users();
        });
    };

    self.update_player_info = function () {
        $.post(update_player_info_url);
    };

    self.update_users = function () {
        var update = setInterval(function () {
            if (!self.vue.logged_in){
                clearInterval(update);
            }
            $.getJSON(update_users_url, function (data) {
                self.vue.users = data.users;
            });
        }, 3000);
    };

    self.send_msg = function () {
        $.post(send_msg_url,
            {
                msg: self.vue.new_msg,
                author: self.vue.user_username,
                the_time: Date.now(),
                chat_id: self.vue.chat_id
            },
            function () {
                self.vue.new_msg = null;
            });
    };

    self.get_new_msgs = function() {
        var update = setInterval(function () {
            if (!self.vue.logged_in){
                clearInterval(update);
            }
            $.post(get_new_msgs_url,
                {
                    the_time: self.vue.login_time,
                    chat_id: self.vue.chat_id
                },
                function (data) {
                    if (data.messages.length > self.vue.messages.length) {
                        self.vue.messages = data.messages;
                        // self.vue.messages.push.apply(self.vue.messages, data.messages);
                    }
                });
        }, 2000);
    };
	
    self.create_id = function () {
        self.vue.creating_game = true;
    };
	
	self.cancel_create = function() {
		self.vue.creating_game = false; 
	};
	
	self.create_game = function () {
	    console.log("it is " + self.vue.user_id);
		$.post(add_game_url,
            {
                new_game: self.vue.new_game,
                id: self.vue.user_id,
                new_pass: self.vue.new_pass,
                public_checked: self.vue.public_checked
            },
            function(){
		        window.location.href = 'game_lobby';
		    }
		);
		
	};
	
    self.get_games = function() {
        setTimeout(function () {
            $.post(get_games_url,
                function (data) {
					self.vue.games = data.games;
                }
            );
        }, 100);

        var update = setInterval(function () {
            if (!self.vue.logged_in){
                clearInterval(update);
            }
            $.post(get_games_url,
                function (data) {
					self.vue.games = data.games;
                }
            );
        }, 2000);
	};

    self.join_game = function (game_id) {
        console.log(game_id);
        $.post(join_game_url,
            {
                game_id: game_id,
                user_id: self.vue.user_id,
            },
            function(){
		        window.location.href = 'game_lobby';
		    }
		);

	};

    self.ask_for_password = function (game_id) {
        var toggle = false;
        self.vue.games.forEach(function (game) {
            if (game.id === game_id) {
                toggle = !game.inputting_password;
                game.inputting_password = !game.inputting_password;
            } else {
                game.inputting_password = false;
            }
            self.vue.password_input = null;
        });

        $.post(ask_for_password_url,
            {
                game_id: game_id,
                toggle: toggle,
            });
    };

    self.check_password = function (game_id){
        self.vue.games.forEach(function (game) {
            if (game.id === game_id && game.password === self.vue.password_input) {
                self.join_game(game_id);
            }
        });
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            users: [],
            chat_id: -1,
            user_id: null,
            user_username: null,
            logged_in: false,
            messages: [],
            new_msg: null,
            login_time: null,
			games: [], 
			creating_game: false,
			new_game: null,
            password_input: null,
            public_checked: true,
            new_pass: null,
        },
        methods: {
            send_msg: self.send_msg,
			create_id: self.create_id,
			cancel_create: self.cancel_create,
			create_game: self.create_game,
			get_games: self.get_games,
            join_game: self.join_game,
            ask_for_password: self.ask_for_password,
            check_password: self.check_password,
        }

    });

    self.vue.login_time = Date.now();
    self.get_users();
    self.get_new_msgs();
	self.get_games();

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
