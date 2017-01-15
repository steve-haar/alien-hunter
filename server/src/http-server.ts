import * as express from 'express';
import * as http from 'http';

export class HttpServer {  
  constructor(private app: express.Express) {
  }

  setup() {
    this.app.get('/', function (req, res) {
      res.send('<h1>hello world</h1>');
    });
  }
}
