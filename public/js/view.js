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
        var _this = this;
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

        // This needs to be replaced with a real events list
        for (var i in data.events) {
            this.$el.find("#eventList").append(new boneboiler.views.eventItem(data.events[i]).el);
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
        var _this = this;

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

        // This needs to be replaced with a real events list
        for (var i in data.users) {
            this.$el.find("#userList").append(new boneboiler.views.userItem(data.users[i]).el);
        }
    },
});

boneboiler.views.userItem = View.extend({
    className: "row",
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
        this.hideConfirms()
        this.$el.find('select#emailPrefs').val((this.$el.find('select#emailPrefs').val() == 'normal') ? 'staff' : 'normal')
    },
    changeRole: function(e) {
        var _this = this,        
            data = {
                'user' : {
                    'roles': [
                        this.$el.find('select#emailPrefs').val()
                    ]
                }
            };

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
    hideConfirms: function() {
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
