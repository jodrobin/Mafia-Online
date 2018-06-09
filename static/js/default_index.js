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
            self.update_users();
        });
    };

    self.update_users = function () {
        setInterval(function () {
            $.getJSON(update_users_url, function (data) {
                if (!self.vue.logged_in){
                    clearInterval(self.update_users);
                } else {
                    self.vue.users = data.users;
                }
            });
        }, 3000);
    };

    self.send_msg = function () {
        $.post(send_msg_url,
            {
                msg: self.vue.new_msg,
                author: self.vue.user_username,
                the_time: Date.now()
            },
            function () {
                self.vue.new_msg = null;
            });
    };

    self.get_new_msgs = function() {
        setInterval(function () {
            if (!self.vue.logged_in){
                clearInterval(self.get_new_msgs);
            }
            $.post(get_new_msgs_url,
                {
                    the_time: self.vue.login_time
                },
                function (data) {
                    if (data.messages.length > self.vue.messages.length) {
                        self.vue.messages = data.messages;
                        // self.vue.messages.push.apply(self.vue.messages, data.messages);
                    }
                    self.vue.prev_time = Date.now();
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
            logged_in: false,
            messages: [],
            new_msg: null,
            login_time: null,
        },
        methods: {
            send_msg: self.send_msg,
        }

    });

    self.vue.login_time = Date.now();
    self.get_users();
    self.get_new_msgs();


    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
