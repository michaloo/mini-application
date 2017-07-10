const express = require("express");
const low = require("lowdb");
const EventEmitter = require("events");
const bodyParser = require("body-parser");
const http = require("http");
const fs = require("fs");
const request = require("superagent");
const superagentPromisePlugin = require("superagent-promise-plugin");
const _ = require("lodash");
const Promise = require("bluebird");
const util = require("util");
const sinon = require("sinon");

const faker = require("faker");
const shell = require("shelljs");
const moment = require("moment");

/**
 * Base class allowing to run simple mocking server with express and lowdb.
 * Can be extended to provide custom functionality.
 */
class MiniApplication {
  constructor() {
    this.app = express();
    this.db = low();
    this.requests = low().defaults({ incoming: [], outgoing: [] });
    this.shell = shell;
    this.moment = moment;
    this.faker = faker;
    this._ = _;
    this.port;
    this.server = http.createServer(this.app);

    this.app.use(bodyParser.json());
    this.app.use((req, res, next) => {
      this.requests.get("incoming").push(_.pick(req, "headers", "url", "method", "body", "query", "params")).write();
      const count = this.requests.get("incoming").value().length;
      this.emit("incoming.request", req, count);
      this.emit(`incoming.request#${count}`, req, count);
      this.emit(`incoming.request@${req.url}`, req, count);
      this.emit(`incoming.request@${req.method}${req.url}`, req, count);
      next();
    });

    sinon.addBehavior("respond", (fake, arg1, arg2 = "") => {
      if (_.isFunction(arg1)) {
        return fake.callsFake(arg1);
      }

      if (_.isNumber(arg1)) {
        return fake.callsFake((req, res) => {
          res.status(arg1).end(arg2);
        });
      }

      if (_.isObject(arg1)) {
        return fake.callsFake((req, res) => {
          res.json(arg1);
        });
      }

      if (_.isString(arg1)) {
        return fake.callsFake((req, res) => {
          res.end(arg1);
        });
      }
    });

    this.stubApp = (method, url, query, body) => {
      if (!url) {
        url = method;
        method = null;
      }

      method = method || sinon.match.any;
      if (_.isString(method)) {
        method = _.upperCase(method);
      }

      url = url || sinon.match.any;
      if (_.isString(url)) {
        url = sinon.match(url);
      }

      query = query || sinon.match.any;
      body = body || sinon.match.any;
      return this.stubMiddleware.withArgs(sinon.match.any, sinon.match.any, sinon.match.any, method, url, query, body);
    };

    this.stubMiddleware = function stubMiddleware(req, res, next, method, url, query, body) {
      next();
    };
    sinon.stub(this, "stubMiddleware");
    this.stubMiddleware.callThrough();
    this.app.use((req, res, next) => {
      this.stubMiddleware(req, res, next, req.method, req.url, req.query, req.body);
    });

    ["get", "post", "put", "delete"].map(verb => {
      this[verb] = (url) => {
        return request[verb](url)
          .use(superagentPromisePlugin)
          .on("request", (reqData) => {
            this.requests.get("outgoing").push(_.pick(reqData, "method", "url", "header", "cookies", "qs", "protocol", "host")).write();
            const count = this.requests.get("outgoing").value().length;
            this.emit("outgoing.request", reqData);
            this.emit(`outgoing.request#${count}`, reqData);
            this.emit(`outgoing.request#${reqData.url}`, reqData);
            this.emit(`outgoing.request#${reqData.method}${reqData.url}`, reqData);
          });
      };
    });
    return this;
  }

  /**
   * Start the internal Express application
   * @param  {Number} port
   * @return {Promise}
   */
  listen(port) {
    this.port = port;
    return Promise.fromCallback((callback) => {
      this.server.listen(port, callback);
    });
  }

  /**
   * Close the server - important for automatic testing when you start and stop the server multiple times.
   */
  close() {
    return Promise.fromCallback((callback) => {
      this.server.close(callback);
    });
  }

  save(name) {
    return this.db.write(name);
  }

  load(name) {
    return this.db.read(name);
  }

  /**
   * For interactive usage - lists all json files in current directory
   * @return {Arrayy}
   */
  list() {
    return this.shell.ls('*.json').map(f => f.replace(".json", ""));
  }
}

util.inherits(MiniApplication, EventEmitter);
module.exports = MiniApplication;
