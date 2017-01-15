import * as express from 'express';
import * as http from 'http';

import { HttpServer } from './http-server';
import { SocketServer } from './socket-server';

let app = express();
let httpServer = http.createServer(app);
let port = process.env.PORT || 3000;

new HttpServer(app).setup();
new SocketServer(httpServer).setup();

httpServer.listen(port, () => console.log(`listening on port ${port}`));
