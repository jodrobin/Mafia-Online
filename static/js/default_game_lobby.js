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

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_id: null,
            users: [],
            game_id: null,
        },
        methods: {
            start_game: self.start_game,
            cancel_game: self.cancel_game,
            leave_game: self.leave_game,
        }

    });

    self.initializeUsers();
    self.check_game();


    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});