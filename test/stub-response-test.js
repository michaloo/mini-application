const { expect } = require("chai");
const sinon = require("sinon");
const request = require("superagent");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Stub", () => {
  let miniApp;
  beforeEach(() => {
    miniApp = new MiniApplication();
    return miniApp.listen(3000);
  });

  it("should allow to stub all metods for given url", () => {
    miniApp.stubApp("/test").respond((req, res) => res.end("ok"));
    return request.get("http://localhost:3000/test")
      .then((res) => {
        expect(res.text).to.eql("ok");
        return request.post("http://localhost:3000/test");
      })
      .then((res) => {
        expect(res.text).to.eql("ok");;
      });
  });

  it("should allow to stub different responses on different calls", () => {
    miniApp.stubApp("/test")
      .onFirstCall()
      .respond((req, res) => res.end("1"))
      .onSecondCall()
      .respond((req, res) => res.end("2"));

    return request.get("http://localhost:3000/test")
      .then((res) => {
        expect(res.text).to.eql("1");
        return request.post("http://localhost:3000/test");
      })
      .then((res) => {
        expect(res.text).to.eql("2");
      });
  });

  it("should allow to stub only selected method", () => {
    miniApp.stubApp("post", "/test").respond((req, res) => res.end("on post call only"));

    return request.get("http://localhost:3000/test")
      .catch((err) => {
        expect(err.status).to.eql(404);
        return request.post("http://localhost:3000/test");
      })
      .then((res) => {
        expect(res.text).to.eql("on post call only");
      });
  });

  it("should respond with json via helper", () => {
    miniApp.stubApp("/test").respond({ foo: "bar" });
    return request.get("http://localhost:3000/test")
      .then((res) => {
        expect(res.body).to.eql({ foo: "bar" });
      });
  });

  it("should respond with status code", () => {
    miniApp.stubApp("/test").respond(503);
    return request.get("http://localhost:3000/test")
      .catch((err) => {
        expect(err.status).to.equal(503);
      });
  });

  it("should respond with text", () => {
    miniApp.stubApp("/test").respond("foo");
    return request.get("http://localhost:3000/test")
      .then((res) => {
        expect(res.text).to.equal("foo");
      });
  });

  afterEach(() => miniApp.close());
});
