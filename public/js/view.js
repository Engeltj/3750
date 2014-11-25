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
                "<li><a href=\"/\">HOME</a></li>",
                "<li><a href=\"/events\">HARVESTING EVENTS</a></li>",
                "<li><a href=\"/account\">ACCOUNT</a></li>",
            ];
            if (boneboiler.admin) {
                this.menu.push("<li><a href=\"/admin\">ADMIN</a></li>")
            }
            this.menu.push("<li><a id=\"logout\" href=\"#\">LOGOUT</a></li>")
        } else {
            this.menu = [
                "<li><a href=\"/register\">REGISTER</a></li>",
                "<li><a href=\"/login\">LOGIN</a></li>"
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
    }
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
    events: {
        "click #login_btn" : "login",
    },
    login: function(e) {
        e.preventDefault();
        
        var valid = true, 
            data = {};

        // Make sure each form field has a value
        _.each(this.$el.find('input'), function(elem, i) {
            if ($(elem).val() == '') {
                $(elem).parent().addClass('has-error');
                valid = false;
            } else {
                data[$(elem).attr('id')] = $(elem).val();
            }
        });

                // Let the user know they screwed up
        if (!valid) {
            alert('Fields are missing values!');
        } else {
            console.log(data);

            $.ajax({
                url: boneboiler.config.API + '/users/authenticate',
                type: 'POST',
                crossDomain: true,
                data: JSON.stringify(data),
                processData: false,
                contentType: 'application/json',
                success: function(res) {
                    boneboiler.user = res.user;
                    DB.write('token', res.token);
                    Backbone.history.navigate("/", true);
                },
                error: function(res) {
                    console.log(res)
                    alert(res.responseJSON.message)
                },
            })
        }
    }
});

boneboiler.views.register = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#registerTPL').html()));
    },
    events: {
        'click button[type="submit"]' : 'register',
    },
    register: function(e) {
        // Don't let the form submit
        e.preventDefault();

        // Defaults
        var valid = true, 
            data = { 
                    'user': {
                            'emailEnabled' : false,
                            'company'      : '',
                            'userNotes'    : '',
                            'roles'        : ['normal'],
                            'locations'    : [],
                        }
                    };

        // Make sure each form field has a value
        _.each(this.$el.find('input'), function(elem, i) {
            if ($(elem).val() == '') {
                $(elem).parent().addClass('has-error');
                valid = false;
            } else {
                if ($(elem).attr('id') != 'passwordConfirm') data.user[$(elem).attr('id')] = $(elem).val();
            }
        });

        // Let the user know they screwed up
        if (!valid) {
            alert('Fields are missing values!');
        // Password check
        } else if (valid && this.$el.find('#passwordHash').val() != this.$el.find('#passwordConfirm').val()) {
            this.$el.find('#passwordHash').parent().addClass('has-error');
            this.$el.find('#passwordConfirm').parent().addClass('has-error');
            alert('Passwords don\'t match!');
        } else {
            // Send the data!
            console.log(data);

            $.ajax({
                url: boneboiler.config.API + '/users',
                type: 'POST',
                crossDomain: true,
                data: JSON.stringify(data),
                processData: false,
                contentType: 'application/json',
                success: function(res) {
                    console.log(res)
                },
                error: function(res) {
                    console.log(res)
                    alert(res.responseJSON.message)
                },
            })
        }
    }
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
            this.$el.find("#eventList").append(new boneboiler.views.eventItem(eventTestData.events[i]).el);
        }
    },
    events: {
        "click #donateBtn" : "donate",
        "click #searchBtn" : "search",
        "keyup #searchField" : "search"
    },
    donate: function(e) {
        new boneboiler.modals.addEvent();
    },
    search: function(e) {
        entries = $('#eventList').children();
        filter_tokens = $('#searchField')[0].value.split(" "); //tokenize the search field data
        entries.show(); //show all entries

        for (i=0;i<filter_tokens.length;i++){ //loop through each keyword in search field
            filter_tokens[i] = filter_tokens[i].toUpperCase(); //for case insensitivity
            entries.filter(function() {
                return ($(this).text().toUpperCase().indexOf(filter_tokens[i]) == -1) //if keyword not found, we hide
            }).hide();

            //entries.filter(":not(:contains('"+filter_tokens[i]+"'))").hide() // case sensitive approach
        }
    }
});

boneboiler.views.eventItem = View.extend({
    initialize: function(options) {
        this.render(options);
    },
    render: function(options) {
        // Need to change the button depending on event state
        var html = _.template($("#eventItemTPL").html())({ data: options });
        this.$el.append(html);
    },
    events: {
        "click #join" : "join",
    },
    join: function(e) {
        alert(this.$el.find("p.text-right.hidden-xs").text())
    },
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

        // This needs to be replaced with a real events list
        for (var i in usersTestData.users) {
            this.$el.find("#userList").append(new boneboiler.views.userItem(usersTestData.users[i]).el);
        }
    },
});

boneboiler.views.userItem = View.extend({
    initialize: function(options) {
        this.render(options);
    },
    render: function(options) {
        // Need to change the button depending on event state
        var html = _.template($("#userItemTPL").html())({ data: options });
        this.$el.append(html);
    },
    events: {
        "change #emailPrefs" : "roleChangeConfirm",
        "click #confirm-btn" : "changeRole",
        "click #cancel-btn"  : "roleChangeCancel",
    },
    roleChangeConfirm: function(e) {
        $(e.currentTarget).parent().removeClass('col-xs-12').addClass('col-xs-6 col-sm-5')
        this.$el.find('.confirmation-btns').css('display', 'block')
    },
    roleChangeCancel: function(e) {
        this.hideConfirm()
        this.$el.find('select#emailPrefs').val((this.$el.find('select#emailPrefs').val() == 'normal') ? 'staff' : 'normal')
    },
    changeRole: function(e) {
        // Actually upload the change
        console.log(this.$el.find('select#emailPrefs').val())
        this.hideConfirm()
    },
    hideConfirm: function() {
        this.$el.find('select#emailPrefs').parent().addClass('col-xs-12').removeClass('col-xs-6 col-sm-5')
        this.$el.find('.confirmation-btns').css('display', 'none')
    }
})

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

var usersTestData = {
    "users": [
        {  
            "id": 1,
            "firstname": "John",
            "lastname": "Doe",
            "email": "john@example.com",
            "role": "staff",
            "phone": 9052435432,
            "locations": [
                {
                    "id": 5,
                    "description": "Home",
                    "address1": "41 Old Rd",
                    "address2": "",
                    "city": "Guelph",
                    "postal": "N1G O0O",
                    "country": "Canada"
                }
            ],
            "created": "2014-11-14T22:36:12.976Z",
            "emailEnabled": true,
            "emailVerified": true
        },
        {  
            "id": 2,
            "firstname": "Jane",
            "lastname": "Doe",
            "email": "Jane@example.com",
            "role": "normal",
            "phone": 9055432243,
            "locations": [
                {
                    "id": 6,
                    "description": "Home",
                    "address1": "Unit 40",
                    "address2": "3 Fake Rd",
                    "city": "Guelph",
                    "postal": "N1G O0O",
                    "country": "Canada"
                },
                {  
                    "id": 7,
                    "description": "Ochard",
                    "address1": "3 Real Rd",
                    "address2": "",
                    "city": "Guelph",
                    "postal": "N1G O0O",
                    "country": "Canada"
                }
            ],
            "created": "2014-11-14T22:36:14.976Z",
            "emailEnabled": true,
            "emailVerified": true
        }
    ]
};