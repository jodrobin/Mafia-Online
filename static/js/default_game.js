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
                            self.vue.is_day = false;
                            self.vue.phase = 'Night';
                            self.vue.start_time = Date.now();
                        } else {
                            self.vue.start_time = Date.now();
                            self.vue.turn++;
                            self.vue.phase = 'Day';
                            self.vue.is_day = true;

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

    self.perform_action = function(playerID, targetID){
    console.log(playerID);
    console.log(targetID);
    var player = null;
    var target = null;
    for(var i = self.vue.users.length - 1; i >= 0; i--)
        {

            if (self.vue.users[i].user_id == playerID)
            {
                player = self.vue.users[i]
            }
            if (self.vue.users[i].user_id == targetID)
            {
                target = self.vue.users[i]
            }
        }
    console.log(player.username)
    console.log(target.username)
    if (player.initial_role == "Robber")
        {
            self.robber(player, target)
        }
    if (player.initial_role == "Troublemaker")
        {
            self.troublemaker(player, target)
        }
    if (player.initial_role == "Seer")
        {
            self.seer(player, target)
        }
    };

    self.robber = function(player, target) {
        $.post(swap_players_url,
        {
            p1: player.user_id,
            p2: target.user_id,
            p1_role: player.role,
            p2_role: target.role,
        },
        function(){
            self.initializeUsers()
        })


    };
    self.troublemaker = function(player, target) {
        if (self.troublemaker_target1 == null && target.user_id != player.user_id)
        {
            self.troublemaker_target1 = target
        }
        else if (self.troublemaker_target1.user_id != target.user_id)
        {
            $.post(swap_players_url,
        {
            p1: self.troublemaker_target1.user_id,
            p2: target.user_id,
            p1_role: self.troublemaker_target1.role,
            p2_role: target.role,
        },
        function(){
            self.initializeUsers()
            self.troublemaker_target1 = null
        })
        }
    };

    self.seer = function(player, target) {
        if (target.user_id != player.user_id)
        {
            console.log("Seer sees: " + target.role)
        }
    }



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
            is_day: true,
            test: 0,
            has_game_ended: false,
            messages: [],
            new_msg: null,
            start_time: null,
            troublemaker_target1: null
        },
        methods: {
            send_msg: self.send_msg,
            perform_action: self.perform_action,
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