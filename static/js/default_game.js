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
        self.vue.timer_seconds = 10;

        var func = setInterval( function() {
            self.vue.timer_seconds--;
            self.vue.chat_timer--;

            if (self.vue.timer_seconds <= 3) {
                self.initializeUsers();
            }

            if (self.vue.chat_timer <= 0){
                self.get_new_msgs();
                self.vue.chat_timer = 2;
            }

            if (self.vue.timer_seconds <= 0) {
                if (self.vue.timer_minutes <= 0){
                    if (self.vue.phase_count < self.vue.phase_max - 1) {
                        self.initializeUsers();
                        self.vue.timer_minutes = 0;
                        self.vue.timer_seconds = 30;
                        if (self.vue.phases[self.vue.phase_count] ==="Troublemaker")
                        {
                            self.vue.timer_minutes = 1;
                            self.vue.is_day = true;
                        }
                        if (self.vue.phases[self.vue.phase_count] === "Voting")
                        {
                            self.vue.timer_seconds = 5;
                        }
                        if (self.vue.phases[self.vue.phase_count]==="Initializing")
                        {
                            self.vue.player_log += "Your initial role is " + self.get_role() + "\n";
                            if (self.get_role() === "Mafia")
                                {
                                    self.vue.player_log += self.display_mafia() + "\n"
                                }
                        }

                        self.vue.phase_count += 1;

                    } else {
                        self.vue.has_game_ended = true;
                        self.tally_votes();
                        clearInterval(func);
                    }
                } else {
                    self.vue.timer_minutes--;
                    self.vue.timer_seconds = 60;
                }
            }

        }, 1000 );
    };

    self.display_mafia = function() {
        var list = "The Mafia to start are: ";
        for(var i = self.vue.users.length - 1; i >= 0; i--)
            {
                if (self.vue.users[i].role === "Mafia"){
                    list += self.vue.users[i].username + " ";
                }
            }
            return list
    };

    self.get_role = function() {
        self.initializeUsers();
        for(var i = self.vue.users.length - 1; i >= 0; i--)
            {
                if (self.vue.users[i].user_id === user_id){
                    return self.vue.users[i].role;
                }
            }
            return "error"
    };

    self.tally_votes = function() {

        $.getJSON(get_votes_url,  function(data){
            var plays = data.players;
            var mafia_present = false;
            var all_even = true;
            var current_max = 0;
            var mafia_dies = false;
            for(var i = 0; i < plays.length; i++){
                if (plays[i].role ==="Mafia"){
                    mafia_present = true;
                    if(plays[i].count >= current_max)
                    {
                        current_max = plays[i].count;
                        mafia_dies = true
                    }
                    all_even = false;
                }
                if (plays[i].count > current_max){
                    current_max = plays[i].count;
                    if(i > 0){
                        all_even = false;
                    }
                    mafia_dies = false;
                }

            }
            console.log(mafia_present);
            console.log(current_max);
            console.log(all_even);
            console.log(mafia_dies);
            if(mafia_present === true && mafia_dies === false)
            {
                self.vue.mafia_wins = true;
            }
            if(mafia_present=== false && all_even === false)
            {
                self.vue.mafia_wins = true;
            }
        })
    }

    self.initializeUsers = function() {
        $.getJSON(get_ingame_players_url, function(data){
            self.vue.users = data.players;
            self.vue.user_id = data.user_id;
            self.vue.user_username = data.user_username;
            self.vue.game_id = data.game_id;

            if(self.vue.roles_not_initialized){
                self.vue.roles_not_initialized = false;
                while(self.vue.users.length +3 > self.vue.roles.length)
                {
                    self.vue.roles.push("Villager");
                }
                console.log(self.vue.roles);
                console.log(self.leader());
                if(self.leader())
                {
                    self.assign_roles();
                }
            }
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

    self.leader = function() {
    console.log(self.vue.users.length);
    for(var i = self.vue.users.length - 1; i >= 0; i--)
            {
                console.log(self.vue.users[i]);
                if (self.vue.users[i].user_id === user_id && self.vue.users[i].leader){
                    return true
                }
            }
            return false
    };

    self.assign_roles = function() {
        for(var i = self.vue.users.length - 1; i >= 0; i--)
            {
                var x = Math.floor((Math.random() * (i+3)));
                $.post(update_roles_url,
                    {
                        player: self.vue.users[i].user_id,
                        role: self.vue.roles[x],

                    },
                    function () {
                        self.initializeUsers();
                    });

                 if (x > -1) {
                    self.vue.roles.splice(x, 1);
                 console.log(self.vue.roles);
}

            }
        self.initializeUsers();
    };

    self.get_new_msgs = function() {

        $.post(get_new_msgs_url,
            {
                the_time: self.vue.start_time,
                chat_id: self.vue.game_id
            },
            function (data) {
                self.vue.messages = data.messages;
            });
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
        console.log(player.username);
        console.log(target.username);
        if (player.initial_role === "Robber" && self.vue.phases[self.vue.phase_count] === "Robber" && !self.vue.done)
            {
                self.robber(player, target);
                self.vue.done = true;

            }
        if (player.initial_role === "Troublemaker" && self.vue.phases[self.vue.phase_count] === "Troublemaker" && !self.vue.done)
            {
                self.troublemaker(player, target);

            }
        if (player.initial_role === "Seer" && self.vue.phases[self.vue.phase_count] === "Seer" && !self.vue.done)
            {
                self.seer(player, target);
                self.vue.done = true;
            }
        if(self.vue.phases[self.vue.phase_count] === "Voting")
        {
            $.post(cast_vote_url,
                {
                    p1: player.user_id,
                    vote: target.user_id,
                },
                function(){
                    self.initializeUsers();
                })
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
            self.initializeUsers();
            self.vue.player_log += "You stole the role of " + target.role + "\n";
            self.vue.player_log += "Your new role is " + target.role + "\n";
        })


    };
    self.troublemaker = function(player, target) {
        if (self.troublemaker_target1 == null && target.user_id !== player.user_id)
        {
            self.troublemaker_target1 = target;
        }
        else if (self.troublemaker_target1.user_id !== target.user_id)
        {
            $.post(swap_players_url,
        {
            p1: self.troublemaker_target1.user_id,
            p2: target.user_id,
            p1_role: self.troublemaker_target1.role,
            p2_role: target.role,
        },
        function(){
            self.initializeUsers();
            self.troublemaker_target1 = null;
            self.vue.done = true;
        })
        }
    };

    self.seer = function(player, target) {
        if (target.user_id !== player.user_id)
        {
            self.vue.player_log += "The seer sees a " + target.role + "\n";

        }
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
            roles: ["Mafia", "Mafia", "Seer", "Robber", "Troublemaker", "Villager"],
            game_id: null,
            mafia_wins: false,
            turn: 0,
            phase: 'Day',
            is_day: false,
            roles_not_initialized: true,
            chat_timer: 2,
            has_game_ended: false,
            messages: [],
            new_msg: null,
            start_time: null,
            troublemaker_target1: null,
            phases: ["Initializing", "Seer","Robber","Troublemaker","Discussion","Voting", "Tallying Votes" ],
            phase_count: 0,
            phase_max: 0,
            player_log: " ",
            done: false,

        },
        methods: {
            send_msg: self.send_msg,
            perform_action: self.perform_action,
        }

    });
    self.vue.phase_max = self.vue.phases.length;
    self.vue.start_time = Date.now();
    self.initializeUsers();

    while(self.vue.users.length +3 > self.vue.roles.length)
    {
        self.vue.roles.push("Villager");
    }
    console.log(self.vue.roles);
    console.log(self.leader());
    if(self.leader())
    {
        self.assign_roles()
    }
    self.getTimer();
    self.get_new_msgs();

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});