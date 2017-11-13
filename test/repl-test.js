const { expect } = require("chai");
const sinon = require("sinon");

const {
  startReplServer,
  mixinReplContext,
  setupReplServer
} = require("../src/repl");

describe("Repl Server Helper", () => {
  it("should create repl server", () => {
    const replServer = startReplServer("foo > ");
    console.log(replServer._prompt);
  });

  it("should create repl server", () => {
    const appSpy = new Proxy({}, {
      get: () => {
        console.log("GETTER");
        return () => {};
      }
    });
    const replSpy = {
      context: {}
    };
    mixinReplContext(replSpy, appSpy);
    console.log(replSpy.context);
  });
});
