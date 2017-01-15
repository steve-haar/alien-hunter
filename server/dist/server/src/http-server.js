"use strict";
class HttpServer {
    constructor(app) {
        this.app = app;
    }
    setup() {
        this.app.get('/', function (req, res) {
            res.send('<h1>hello world</h1>');
        });
    }
}
exports.HttpServer = HttpServer;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/http-server.js.map