/*** BASE VIEW ***/
var View = Backbone.View.extend({
    rerender: function(){
        this.undelegateEvents();
        this.render();
    },
    kill: function(){
        this.undelegateEvents();
        this.stopListening();
    },
});

boneboiler.views.nav = View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        // Logged in
        if (boneboiler.user) {
            this.menu = [
                "<li><a href=\"/\">Home</a></li>",
                "<li><a href=\"/events\">Harvesting Events</a></li>",
                "<li><a href=\"/account\">Account</a></li>",
            ];
            if (boneboiler.admin) {
                this.menu.push("<li><a href=\"/admin\">Admin</a></li>")
            }
            this.menu.push("<li><a id=\"logout\" href=\"#\">Logout</a></li>")
        } else {
            this.menu = [
                "<li><a href=\"/login\">Login</a></li>",
                "<li><a href=\"/register\">Register</a></li>",
            ];
        }

        this.$el.html(_.template($('#navTPL').html()));

        this.$el.find("#actions").html(this.menu.join(""))
    },
    update: function() {
        this.render();
    },
    events: {
        "click #logout" : "logout",
    },
    logout: function(e) {
        e.preventDefault();

        boneboiler.user = false
        this.update();
        Backbone.history.navigate("/", true);
    },
});

boneboiler.views.home = View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(_.template($('#homeTPL').html()));
    }
});

boneboiler.views.login = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#loginTPL').html()));
    },
});

boneboiler.views.register = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#registerTPL').html()));
    },
});

boneboiler.views.forgot = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#forgotTPL').html()));
    },
});

boneboiler.views.events = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#eventTPL').html()));

        // This needs to be replaced with a real events list
        for (var i in eventTestData.events) {
            new boneboiler.views.eventItem(eventTestData.events[i]);
        }
    },
    events: {
        "click #donateBtn" : "donate",
        "click #searchBtn" : "search",
    },
    donate: function(e) {
        new boneboiler.modals.addEvent();
    },
    search: function(e) {
        alert('event search goes here');
    }
});

boneboiler.views.eventItem = View.extend({
    el: "#eventList",
    initialize: function(options) {
        this.render(options);
    },
    render: function(options) {
        this.$el.append(_.template($("#eventItemTPL").html(), options));
    }
})

boneboiler.views.account = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#accountTPL').html()));
    },
    events: {
        "click #saveBtn" : "save",
    },
    save: function(e) {
        alert('Saving account prefs goes here');
    },
});

boneboiler.views.admin = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#adminTPL').html()));
    },
});

boneboiler.modals.addEvent = View.extend({
    el: "#modals",
    initialize: function() {
        var _this = this;
        this.render();

        // Little timeout hack to make sure the modal's HTML is put into the DOM before we try to open it
        setTimeout(function() {
            var modal = _this.$el.find('#addEventModal').modal();
        }, 50);
    }, 
    render: function() {
        this.$el.html(_.template($('#addEventTPL').html()));
    },
    events: {
        "click .close": "cleanup",
        "click #submit": "post",
    },
    cleanup: function(e) {
        var _this = this;
        e.preventDefault();
        this.$el.find("#addEventModal").modal('hide');

        // Similar modal hack to make sure we cleanup any modals we generate
        setTimeout(function() {
            _this.$el.find('#addEventModal').remove();
        }, 200);
    },
    post: function(e) {
        alert("Saving the event goes here");
    },
});

var eventTestData = {
    "events": [
        {
            "id": 5,
            "owner": {
                "id": 4,
                "firstname": "John",
                "lastname": "Doe",
                "email": "john@example.com",
                "role": "staff",
                "phone": 9052435432,
                "locations": [
                    {
                        "id": 8,
                        "description": "Home",
                        "address1": "41 Old Rd",
                        "address2": "",
                        "city": "Guelph",
                        "postal": "N1G O0O",
                        "country": "Canada"
                    }
                ],
                "created": "2014-11-14T22:36:14.976Z",
                "emailEnabled": true,
                "emailVerified": true
            },
            "description": "Come pick my 4 apple trees!",
            "location": {
                "id": 8,
                "description": "Home",
                "address1": "41 Old Rd",
                "address2": "",
                "city": "Guelph",
                "postal": "N1G O0O",
                "country": "Canada"
            },
            "datetime": "2014-11-18T16:20:27.174Z",
            "duration": 3600,
            "status": "pending",
            "attendees": [],
            "staffNotes": "John doe did <strong>not</strong> show<br /> Jane did and we got 23 apples. Now in the food bank",
            "created": "2014-11-14T22:36:14.976Z"
        },
        {
            "id": 6,
            "owner": {
                "id": 6,
                "firstname": "Jane",
                "lastname": "Doe",
                "email": "jane@example.com",
                "role": "staff",
                "phone": 9052425432,
                "locations": [
                    {
                        "id": 8,
                        "description": "Home",
                        "address1": "41 Street Rd",
                        "address2": "",
                        "city": "Guelph",
                        "postal": "N1G O01",
                        "country": "Canada"
                    }
                ],
                "created": "2014-11-12T22:36:14.976Z",
                "emailEnabled": true,
                "emailVerified": true
            },
            "description": "Come pick my 4 apple trees!",
            "location": {
                "id": 8,
                "description": "Home",
                "address1": "41 Street Rd",
                "address2": "",
                "city": "Guelph",
                "postal": "N1G O01",
                "country": "Canada"
            },
            "datetime": "2014-11-20T16:20:27.174Z",
            "duration": 5400,
            "status": "approved",
            "attendees": [
                {
                    "id": 4,
                    "firstname": "John",
                    "lastname": "Doe",
                    "email": "john@example.com",
                    "role": "normal",
                    "phone": 9052435432,
                    "locations": [
                        {
                            "id": 8,
                            "description": "Home",
                            "address1": "41 Old Rd",
                            "address2": "",
                            "city": "Guelph",
                            "postal": "N1G O0O",
                            "country": "Canada"
                        }
                    ],
                    "created": "2014-11-14T22:36:14.976Z",
                    "emailEnabled": true,
                    "emailVerified": true
                },
                {
                    "id": 20,
                    "firstname": "Jennifer",
                    "lastname": "Gardner",
                    "email": "jenn@gardner.com",
                    "role": "normal",
                    "phone": 9055435432,
                    "locations": [
                        {
                            "id": 8,
                            "description": "Home",
                            "address1": "20 Song Av",
                            "address2": "",
                            "city": "Toronto",
                            "postal": "L7E O0O",
                            "country": "Canada"
                        }
                    ],
                    "created": "2014-11-14T22:36:14.976Z",
                    "emailEnabled": true,
                    "emailVerified": true
                }
            ],
            "staffNotes": "Go through the back entrance",
            "created": "2014-11-10T22:36:14.976Z"
        }
    ]
};