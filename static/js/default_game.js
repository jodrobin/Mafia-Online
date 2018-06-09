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
        self.vue.users = data.players
        })
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
            turn: 0,
            phase: 'Day',
            test: 0,
            has_game_ended: false,
        },
        methods: {
        }

    });
    self.initializeUsers()

    self.getTimer();

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});