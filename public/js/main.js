var AppRouter = Backbone.Router.extend ({
    routes: {
        "*actions" : "transition",
    },
    transition: function (path) {

        boneboiler.path = path || "";

        var view = path ? path : 'home';

        if (!boneboiler.views[view]) {
            $("#content").html("<h1>404</h1>")
            return;
        }

        // update the active state on the nav
        if (boneboiler.nav) {
            boneboiler.nav.update();
        }

        boneboiler.query_string = {}
        try {
            var qs = window.location.href.split("?")[1].split('&');
            for (var i in qs) {
                var parts = qs[i].split('=')
                boneboiler.query_string[parts[0]] = decodeURI(parts[1]);
            }
        } catch(err) {
            // no query string
        }

        // kill some zombies
        if (boneboiler.active) boneboiler.active.kill();

        // add the view to the page
        boneboiler.active = new boneboiler.views[view]({ el: "#content" });

        // update the document title
        document.title = (boneboiler.active.title || boneboiler.config.title) + " | " + boneboiler.config.description;

        // scroll document to top of page
        $(document).scrollTop(0);
    },
});

boneboiler.nav = new boneboiler.views.nav({ el: '#nav' });
new AppRouter;
Backbone.history.start({ pushState: true });

if (DB.read('token')) {
    $.ajax({
        url: boneboiler.config.API + '/users/current',
        type: 'GET',
        crossDomain: true,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic AppleSeed token=" + DB.read('token'))
        },
        success: function(res) {
            boneboiler.user = res.user;
            boneboiler.nav.update();
        },
        error: function(res) {
            console.log(res)
        },
    })
}

$(document).on('click', 'a:not([data-bypass])', function(e){
    href = $(this).prop('href')
    root = location.protocol+'//'+location.host+'/'
    if (root===href.slice(0,root.length)){
        e.preventDefault();
        Backbone.history.navigate(href.slice(root.length), true);
    }
});
