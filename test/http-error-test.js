const { expect } = require("chai");
const sinon = require("sinon");
const request = require("superagent");

const MiniApplication = require("../src/mini-application");

describe("Mini Application", () => {
  let miniApp;
  beforeEach(() => {
    miniApp = new MiniApplication();
    return miniApp.listen(3000);
  });

  it("should allow to cause an error", () => {
    miniApp.stubApp("GET", "/test").respond((req, res) => {
      req.destroy();
      // req.socket.setTimeout(500);
      // req.socket.destroy(new Error('foo bar baz'));
      // req.socket.emit('error', new Error('foo bar baz'));
      // res.socket.setTimeout(500);
      // res.socket.destroy(new Error('foo bar baz'));
      // res.socket.emit('error', new Error('foo bar baz'));
      // res.end("ok");
    });
    return request.get("http://localhost:3000/test").catch((err) => {
      expect(err.code).to.equal("ECONNRESET");
      expect(err.message).to.equal("socket hang up");
    });
  });

  afterEach(() => miniApp.close());
});
