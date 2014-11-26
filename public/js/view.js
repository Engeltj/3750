// BASE VIEW
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

// Nav bar view 
boneboiler.views.nav = View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        // Change the nav bar links depending on whether we're logged in or not
        if (boneboiler.user) {
            this.menu = [
                "<li><a href=\"/\">HOME</a></li>",
                "<li><a href=\"/events\">HARVESTING EVENTS</a></li>",
                "<li><a href=\"/account\">ACCOUNT</a></li>",
            ];
            // Check to see if the logged in user is a staff 
            if ($.inArray("staff", boneboiler.user.roles) != -1) {
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

        // Strip all the user from sessionStorage, boneboiler, update the navbar and redirect home 
        $.ajax({
            url: boneboiler.config.API + '/users/current/logout',
            type: 'POST',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                boneboiler.user = null;
                DB.remove('token');
                boneboiler.nav.update();
                Backbone.history.navigate("/", true);                
            },
            error: function(res) {
                console.log(res)
            },
        })
    }
});

// Simple home page view
boneboiler.views.home = View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(_.template($('#homeTPL').html()));
    }
});

// Login page view
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
            // Get a session token, save the token in sessionStorage and inject user into boneboiler
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
                    alert(res.responseJSON.message)
                },
            })
        }
    }
});

// Register page view
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
            $.ajax({
                url: boneboiler.config.API + '/users',
                type: 'POST',
                crossDomain: true,
                data: JSON.stringify(data),
                processData: false,
                contentType: 'application/json',
                success: function(res) {
                    Backbone.history.navigate("/login", true);
                },
                error: function(res) {
                    console.log(res)
                    alert(res.responseJSON.message)
                },
            })
        }
    }
});

// Unimplemented forgot password page
boneboiler.views.forgot = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#forgotTPL').html()));
    },
});

// Main events view page
boneboiler.views.events = View.extend({
    initialize: function() {
        var _this = this;

        // Get the events and render on success
        $.ajax({
            url: boneboiler.config.API + '/events',
            type: 'GET',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                _this.render(res);
            },
            error: function(res) {
                console.log(res)
                alert(res.responseJSON.message)
            },
        })
    }, 
    render: function(data) {
        this.$el.html(_.template($('#eventTPL').html()));

        // Render the events list
        if (data.events.length > 0) {
            // For each event render and append the HTML of an eventItem view
            for (var i in data.events) {
                this.$el.find("#eventList").append(new boneboiler.views.eventItem({ 'data' : data.events[i], 'parent': this }).el);
            }
        } else {
            this.$el.find("#eventList").html('<h4 class="text-center">No events right now</p>');
        }
    },
    update: function() {
        this.initialize();
    },
    events: {
        "click #donateBtn" : "donate",
        "click #searchBtn" : "search",
        "keyup #searchField" : "search"
    },
    donate: function(e) {
        // Spawn a new event creation modal
        new boneboiler.modals.addEvent({ 'parent': this });
    },
    search: function(e) {
        // Filter the events
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

// Event item subview
boneboiler.views.eventItem = View.extend({
    className: "row",
    parent: null,
    initialize: function(options) {
        // Set the ID of the parent div to the event ID
        this.$el.attr('id', options.data.id);
        // Keep a reference to the parent event page view
        this.parent = options.parent;
        this.render(options.data);
    },
    render: function(options) {
        // Render the eventItem template and pass the event data 
        var html = _.template($("#eventItemTPL").html())({ data: options });
        this.$el.append(html);
    },
    events: {
        "click #join" : "join",
        "click #approve" : "approve",
        "click #unattend" : "unattend",
        "click #cancel" : "cancel",
    },
    // Different events for each button type, mostly the same case though
    join: function(e) {
        var _this = this;
        $.ajax({
            url: boneboiler.config.API + '/events/' + this.$el.attr('id') + '/attend',
            type: 'POST',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                _this.parent.update();
            },
            error: function(res) {
                console.log(res)
                alert(res.responseJSON.message)
            },
        })
    },
    approve: function(e) {
        var _this = this;
        $.ajax({
            url: boneboiler.config.API + '/events/' + this.$el.attr('id') + '/accept',
            type: 'POST',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                _this.parent.update();
            },
            error: function(res) {
                console.log(res)
                alert(res.responseJSON.message)
            },
        })
    },
    unattend: function(e) {
        var _this = this;
        $.ajax({
            url: boneboiler.config.API + '/events/' + this.$el.attr('id') + '/notattend',
            type: 'POST',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                _this.parent.update();
            },
            error: function(res) {
                console.log(res)
                alert(res.responseJSON.message)
            },
        })
    },
    cancel: function(e) {
        var _this = this;
        $.ajax({
            url: boneboiler.config.API + '/events/' + this.$el.attr('id') + '/cancel',
            type: 'POST',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                _this.parent.update();
            },
            error: function(res) {
                console.log(res)
                alert(res.responseJSON.message)
            },
        })
    },
})

// Unimplemented account settings page
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

// Admin page base view 
boneboiler.views.admin = View.extend({
    initialize: function() {
        var _this = this;

        // Get the users and render on success
        $.ajax({
            url: boneboiler.config.API + '/users',
            type: 'GET',
            crossDomain: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                _this.render(res);
            },
            error: function(res) {
                console.log(res)
                alert(res.responseJSON.message)
            },
        })
    }, 
    render: function(data) {
        this.$el.html(_.template($('#adminTPL').html()));

        // For each user make a userItem subview
        for (var i in data.users) {
            this.$el.find("#userList").append(new boneboiler.views.userItem(data.users[i]).el);
        }
    },
});

// User item subview
boneboiler.views.userItem = View.extend({
    className: "row",
    initialize: function(options) {
        this.render(options);
    },
    render: function(options) {
        var html = _.template($("#userItemTPL").html())({ data: options });
        this.$el.append(html);
    },
    events: {
        "change #emailPrefs" : "roleChangeConfirm",
        "click #confirm-btn" : "changeRole",
        "click #cancel-btn"  : "roleChangeCancel",
    },
    // Show the role change confirmation buttons on the view
    roleChangeConfirm: function(e) {
        $(e.currentTarget).parent().removeClass('col-xs-12').addClass('col-xs-6 col-sm-5')
        this.$el.find('.confirmation-btns').css('display', 'block')
    },
    // Hide buttons on cancel button press
    roleChangeCancel: function(e) {
        this.hideConfirms()
        this.$el.find('select#emailPrefs').val((this.$el.find('select#emailPrefs').val() == 'normal') ? 'staff' : 'normal')
    },
    // Change the user's role
    changeRole: function(e) {
        var _this = this,        
            data = {
                'user' : {
                    'roles': [
                        this.$el.find('select#emailPrefs').val()
                    ]
                }
            };

        // On success hide the confirms 
        $.ajax({
            url: boneboiler.config.API + '/users/' + _this.$el.attr('id'),
            type: 'PUT',
            crossDomain: true,
            data: JSON.stringify(data),
            processData: false,
            contentType: 'application/json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
            },
            success: function(res) {
                _this.hideConfirms()
            },
            error: function(res) {
                console.log(res)
                alert(res.responseJSON.message)
            },
        });
    },
    // Helper function to hide the buttons
    hideConfirms: function() {
        this.$el.find('select#emailPrefs').parent().addClass('col-xs-12').removeClass('col-xs-6 col-sm-5')
        this.$el.find('.confirmation-btns').css('display', 'none')
    }
})

boneboiler.modals.addEvent = View.extend({
    el: "#modals",
    parent: null,
    initialize: function(options) {
        var _this = this;
        this.parent = options.parent
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
        // Don't let the form submit
        e.preventDefault();

        // Defaults
        var valid = true,
        _this = this, 
        dataEvent = { 
            "event": {
                "owner": {
                    "id": boneboiler.user.id
                },
                "description": "",
                "location": {
                    "id": -1
                },
                "datetime": "", //2014-11-18T16:20:27.174Z
                "endtime": "",
                "trees": [
                    {
                        "type": "",
                        "quantity": -1,
                    }
                ],
                "attendees": [],
                "staffNotes": ""
            }
        }, 
        dataLocation = {
            "location": {  
                "description": "",
                "address1": "",
                "address2": "",
                "city": "",
                "postal": "",
                "country": "Canada",
                "latitude": "",
                "longitude": ""
            }
        }


        // Make sure each form field has a value
        var description = this.$el.find('textarea')[0];
        if ($(description).val().length == 0){
            $(description).parent().addClass('has-error');
        } else {
            dataEvent.event.description = $(description).val();
            $(description).parent().removeClass('has-error');
        }
        _.each(this.$el.find('input'), function(elem, i) {
            if ($(elem).val() == '') {
                $(elem).parent().addClass('has-error');
                valid = false;
            } else { //if field has a value, assign it to the correct json object
                if (dataLocation['location'][elem.id] != null){
                    dataLocation['location'][elem.id] = $(elem).val();
                } else if (dataEvent.event[elem.id] != null){
                    dataEvent.event[elem] = $(elem).val();
                }
                $(elem).parent().removeClass('has-error');
            }
        });

        //parse date
        if ($('#date').val().split('-').length != 3){
            $('#date').parent().addClass('has-error');
            valid = false;
        }

        //parse time
        if ($('#time').val().split(':').length < 2){
            $('#time').parent().addClass('has-error');
            valid = false;
        }

        //create date object
        var datetime = $('#date').val() + '-' + $('#time').val()
        var dt = datetime.replace(':', '-').split('-')
        
        //assign date object to json object for adding to database
        dataEvent.event['datetime'] = new Date(dt[0], dt[1], dt[2], dt[3], dt[4], 0, 0);
        dataEvent.event['endtime'] = dataEvent.event['datetime'];


        // Let the user know they screwed up
        if (!valid) {
            alert('Fields are missing input or have incorect values!');
        } else {
            // Send the data!
            var locationId = -1;
            $.ajax({ //add location object to database, if success, add event object
                url: boneboiler.config.API + '/users/' + boneboiler.user.id + '/locations',
                type: 'POST',
                crossDomain: true,
                data: JSON.stringify(dataLocation),
                processData: false,
                contentType: 'application/json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
                },
                success: function(res) {
                    locationId = parseInt(res.locations[0]['id']);
                    if (locationId > 0){ //if we got an id for location object, create the event object using this ID
                        dataEvent.event.location.id = locationId;
                        $.ajax({
                            url: boneboiler.config.API + '/events',
                            type: 'POST',
                            crossDomain: true,
                            data: JSON.stringify(dataEvent),
                            processData: false,
                            contentType: 'application/json',
                            beforeSend: function(xhr) {
                                xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
                            },
                            success: function(res) {
                                _this.parent.update();

                                //hide the modal
                                _this.$el.find("#addEventModal").modal('hide');

                                // Similar modal hack to make sure we cleanup any modals we generate
                                setTimeout(function() {
                                    _this.$el.find('#addEventModal').remove();
                                }, 200);
                            },
                            error: function(res) {
                                console.log(res)

                                alert(res.responseJSON.message)
                            },
                        })
                    }
                },
                error: function(res) {
                    console.log(res)
                    alert(res.responseJSON.message)
                },
            })
        }
    },
});
