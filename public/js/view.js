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
    events: {
        "click #logout" : "logout",
    },
    update: function() {
        this.render();
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
    },
});

boneboiler.views.account = View.extend({
    initialize: function() {
        this.render();
    }, 
    render: function() {
        this.$el.html(_.template($('#accountTPL').html()));
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