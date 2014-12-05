3750
====

The front end interface for the AppleSeed Collective.

Front end must be served by a simple webserver. Place the contents of the public folder in your apache folder. 

For development, you can use pythons simple HTTP server to server the contents:

    $ cd public
    $ Python -m simplehttpserver

In a production enviroment, all routes should be redirected to index.html.
