const { expect } = require("chai");
const sinon = require("sinon");
const request = require("superagent");
const Promise = require("bluebird");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Outgoing Requests", () => {
  let miniApp;
  before(() => {
    miniApp = new MiniApplication();
    return miniApp.listen(3000);
  });

  it("should allow to perform an outgoing request", (done) => {
    miniApp.stubApp("/test").respond("foo");

    miniApp.request("get", "http://localhost:3000/test")
      .then((res) => {
        const lastReq = miniApp.requests.get("outgoing.0").value();
        expect(lastReq.url).to.equal("http://localhost:3000/test");
        expect(res.statusCode).to.equal(200);
        done();
      });
  });

  it("should expose helpers for methods", (done) => {
    miniApp.stubApp("/test").respond("foo");

    Promise.map(["get", "post", "put", "delete"], (verb) => {
      return miniApp[verb]("http://localhost:3000/test")
        .then((res) => {
          const lastReq = miniApp.requests.get("outgoing").last().value();
          expect(lastReq.url).to.equal("http://localhost:3000/test");
          expect(lastReq.method).to.equal(verb.toUpperCase());
          expect(res.statusCode).to.equal(200);
          return true;
        });
    }, { concurrency: 1 }).then(() => done());
  });

  afterEach(() => miniApp.reset());
  after(() => miniApp.close());
});
