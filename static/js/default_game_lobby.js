var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.start_game = function () {
        $.post(start_game_url,
            {
                id: self.vue.game_id
            });
    };

    self.cancel_game = function () {
        $.post(cancel_game_url,
            {
                id: self.vue.game_id
            });
    };

    self.leave_game = function () {
        $.post(leave_game_url,
            {
                id: self.vue.user_id
            },
            function () {
                window.location.href = 'index';
            });
    };

    self.check_game = function () {
        console.log(self.vue.game_id);
        var update = setInterval(function () {
        $.post(check_game_url,
            {
                id: self.vue.game_id
            },
            function (data) {
                if (data.has_started === true) {
                    window.location.href = 'game';
                } else if (data.has_ended === true) {
                    window.location.href = 'index';
                }
            })}, 1500);
    };

    self.initializeUsers = function() {
        $.getJSON(get_ingame_players_url, function(data){
            self.vue.users = data.players;
            self.vue.user_id = data.user_id;
            self.vue.game_id = data.game_id;
            console.log("Data " + data.game_id);
        })
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
	
	self.get_game_id = function () {
		$.post(get_game_id_url, 
			function (data) {
				self.vue.chat_id = data.game_id; 
			});
	};

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_id: null,
            users: [],
            game_id: null,
			chat_id: null, 
			login_time: null, 
			messages: [],
			new_msg: null,
        },
        methods: {
            start_game: self.start_game,
            cancel_game: self.cancel_game,
            leave_game: self.leave_game,
			send_msg: self.send_msg, 
        }

    });

    self.initializeUsers();
    self.check_game();
	self.get_new_msgs(); 
    self.vue.login_time = Date.now();


    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});