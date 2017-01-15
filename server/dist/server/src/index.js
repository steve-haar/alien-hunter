"use strict";
const express = require("express");
const http = require("http");
const http_server_1 = require("./http-server");
const socket_server_1 = require("./socket-server");
let app = express();
let httpServer = http.createServer(app);
let port = process.env.PORT || 3000;
new http_server_1.HttpServer(app).setup();
new socket_server_1.SocketServer(httpServer).setup();
httpServer.listen(port, () => console.log(`listening on port ${port}`));
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/index.js.map