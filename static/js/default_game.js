// This is the js for the default/game.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.getTimer = function(){
        self.vue.timer_minutes = 0;
        self.vue.timer_seconds = 4;

        var func = setInterval( function() {
            self.vue.timer_seconds--;
            if(self.vue.timer_seconds <= 0) {
                if (self.vue.timer_minutes <= 0){
                    if (self.vue.turn === 0) {
                        self.vue.timer_minutes = 0;
                        self.vue.timer_seconds = 4;
                        if (self.vue.phase === 'Day') {
                            self.vue.phase = 'Night';
                        } else {
                            self.vue.turn++;
                            self.vue.phase = 'Day';
                        }
                    } else {
                        self.vue.has_game_ended = true;
                        clearInterval(func);
                    }
                } else {
                    self.vue.timer_minutes--;
                    self.vue.timer_seconds = 60;
                }
            }
        }, 1000 );
    };
    self.initializeUsers = function() {
        $.getJSON(get_ingame_players_url, function(data){
            self.vue.users = data.players;
            self.vue.user_id = data.user_id;
            self.vue.user_username = data.user_username;
            self.vue.game_id = data.game_id;
        })
    };

    self.send_msg = function () {
        $.post(send_msg_url,
            {
                msg: self.vue.new_msg,
                author: self.vue.user_username,
                the_time: Date.now(),
                chat_id: self.vue.game_id
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
                    the_time: self.vue.start_time,
                    chat_id: self.vue.game_id
                },
                function (data) {
                    if (data.messages.length > self.vue.messages.length) {
                        self.vue.messages = data.messages;
                    }
                });
        }, 2000);
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            users: [],
            user_id: null,
            user_username: null,
            timer_minutes: null,
            timer_seconds: null,
            game_id: null,
            turn: 0,
            phase: 'Day',
            test: 0,
            has_game_ended: false,
            messages: [],
            new_msg: null,
            start_time: null,
        },
        methods: {
            send_msg: self.send_msg,
        }

    });

    self.vue.start_time = Date.now();
    self.initializeUsers();

    self.getTimer();
    self.get_new_msgs();

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});