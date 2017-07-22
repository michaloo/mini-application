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

/**
 * Base class allowing to run simple mocking server with express and lowdb.
 * Can be extended to provide custom functionality.
 */
class MiniApplication {
  constructor() {
    // Basic dependencies
    this.app = express();
    this.db = low();
    this.requests = low().defaults({ incoming: [], outgoing: [] });
    this.server = http.createServer(this.app);

    // Setup Express application
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

    /*
     * Sinon stub setup
     */
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
    sinon.stub(this, "_stubMiddleware");
    this._stubMiddleware.callThrough();
    this.app.use((req, res, next) => {
      this._stubMiddleware(req, res, next, req.method, req.url, req.query, req.body);
    });
    return this;
  }

  get(url) {
    return this.request("get", url);
  }

  post(url) {
    return this.request("post", url);
  }

  put(url) {
    return this.request("put", url);
  }

  delete(url) {
    return this.request("delete", url);
  }

  /**
   * @param  {String} verb
   * @param  {String} url
   * @return {Promise}
   */
  request(verb, url) {
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
  }

  /**
   * @param  {String} method
   * @param  {String} url
   * @param  {Object} query
   * @param  {String|Object} body
   * @return {sinon.stub}
   */
  stubApp(method, url, query, body) {
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
    return this._stubMiddleware.withArgs(sinon.match.any, sinon.match.any, sinon.match.any, method, url, query, body);
  }

  _stubMiddleware(req, res, next) { // eslint-disable-line class-methods-use-this
    next();
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
    return fs.writeFileSync(`${name}.mini-app.json`, JSON.stringify(this.db.getState()), "utf-8");
  }

  load(name) {
    return this.db.setState(JSON.parse(fs.readFileSync(`${name}.mini-app.json`, "utf-8")));
  }

  /**
   * For interactive usage - lists all json files in current directory
   * @return {Array}
   */
  list() {
    return this.shell.ls('*.mini-app.json')
      .map(f => f.replace(".mini-app.json", ""));
  }
}

util.inherits(MiniApplication, EventEmitter);
module.exports = MiniApplication;
