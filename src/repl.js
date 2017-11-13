/* @flow */
/*:: import { MiniApplicationInterface } from "./mini-application" */
const repl = require("repl");
const vm = require("vm");

const _ = require("lodash");
const shell = require("shelljs");

/* Optional dependencies */
/* eslint-disable */
let faker;
let moment;

try {
  faker = require("faker");
} catch (e) {}

try {
  moment = require("moment");
} catch (e) {}
/* eslint-enable */

function startReplServer(prompt/*: string */) {
  const replServer = repl.start({
    prompt: prompt,
    useColors: true,
    eval: function(cmd, context, filename, callback) {
      var result = vm.runInContext(cmd, context);

      if (result && result.write instanceof Function && result.__wrapped__) {
        return callback(null, result.write());
      }

      if (result && result.then instanceof Function) {
        return result.then(function(res) {
          callback(null, res)
        }, function(err) {
          callback(null, err)
        });
      }
      callback(null, result);
    }
  });
  return replServer;
}

function mixinReplContext(replServer/*: Object */, miniApplication/*: MiniApplicationInterface */) {
  Object.assign(replServer.context, miniApplication);
  const functions = Object.getOwnPropertyNames(Object.getPrototypeOf(miniApplication))
    // $FlowFixMe
    .concat(Object.getOwnPropertyNames(miniApplication).filter(f => typeof miniApplication[f] === "function"))
    .concat(["on", "once", "save", "load", "stubApp", "listen", "close", "list", "request", "get", "put", "post", "delete"]);
  functions.map(funcName => {
    // $FlowFixMe
    replServer.context[funcName] = miniApplication[funcName].bind(miniApplication);
  });
  replServer.context._ = _;
  replServer.context.faker = faker;
  replServer.context.shell = shell;
  replServer.context.moment = moment;
}

function setupReplServer(replServer/*: Object */, miniApp/*: MiniApplicationInterface */) {
  mixinReplContext(replServer, miniApp);
  replServer.displayPrompt();
  replServer.on("reset", mixinReplContext.bind(null, replServer, miniApp));
  replServer.on("exit", () => {
    miniApp.close();
  });
  return replServer;
}

module.exports =  {
  mixinReplContext,
  startReplServer,
  setupReplServer
};
