const repl = require("repl");
const vm = require("vm");

function startReplServer(prompt) {
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
};

function mixinReplContext(replServer, miniApplication) {
  Object.assign(replServer.context, miniApplication);
  const functions = Object.getOwnPropertyNames(Object.getPrototypeOf(miniApplication))
    .concat(Object.getOwnPropertyNames(miniApplication).filter(f => typeof miniApplication[f] === "function"))
    .concat(["listen", "close", "list"]); // TODO: find more flexible way of mixin' the base class methods
  functions.map(funcName => {
    if (funcName === "_") {
      return replServer.context[funcName] = miniApplication[funcName];
    }
    replServer.context[funcName] = miniApplication[funcName].bind(miniApplication);
  });
}

module.exports =  {
  mixinReplContext,
  startReplServer
};
