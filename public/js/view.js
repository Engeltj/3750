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
        // Logged in
        if (boneboiler.user) {
            this.menu = [
                "<li><a href=\"#\">Home</a></li>",
                "<li><a href=\"#\">Harvesting Events</a></li>",
                "<li><a href=\"#\">Account</a></li>",
            ];
        } else {
            this.menu = [
                "<li><a href=\"#\">Login</a></li>"
            ];
        }
        this.render();
    },
    render: function() {
        this.$el.html(_.template($('#navTPL').html()));

        this.$el.find("#actions").html(this.menu.join(""))
    }
})

boneboiler.views.home = View.extend({
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(_.template($('#homeTPL').html()));
    }
});
