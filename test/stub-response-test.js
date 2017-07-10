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

  it("should allow to stub all metods for given url", (done) => {
    miniApp.stubApp("/test").respond((req, res) => res.end("ok"));
    request.get("http://localhost:3000/test")
      .end((err, res) => {
        expect(res.text).to.be.eql("ok");
        request.post("http://localhost:3000/test")
          .end((err, res) => {
            expect(res.text).to.be.eql("ok");
            done();
          });
      });
  });

  it("should allow to stub different responses on different calls", (done) => {
    miniApp.stubApp("/test")
      .onFirstCall()
      .respond((req, res) => res.end("1"))
      .onSecondCall()
      .respond((req, res) => res.end("2"));

    request.get("http://localhost:3000/test")
      .end((err, res) => {
        expect(res.text).to.be.eql("1");
        request.post("http://localhost:3000/test")
          .end((err, res) => {
            expect(res.text).to.be.eql("2");
            done();
          });
      });
  });

  it("should allow to stub only selected method", (done) => {
    miniApp.stubApp("post", "/test").respond((req, res) => res.end("on post call only"));

    request.get("http://localhost:3000/test")
      .end((err, res) => {
        expect(err.status).to.be.eql(404);
        request.post("http://localhost:3000/test")
          .end((err, res) => {
            expect(res.text).to.be.eql("on post call only");
            done();
          });
      });
  });

  it("should respond with json via helper", (done) => {
    miniApp.stubApp("/test").respond({ foo: "bar" });
    request.get("http://localhost:3000/test")
      .end((err, res) => {
        expect(res.body).to.be.eql({ foo: "bar" });
        done();
      });
  });

  it("should expose status response helper", (done) => {
    miniApp.stubApp("/test").respond(503);
    request.get("http://localhost:3000/test")
      .end((err, res) => {
        expect(err.status).to.be.equal(503);
        done();
      });
  });


  afterEach(() => miniApp.close());
});
