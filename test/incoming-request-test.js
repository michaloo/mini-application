const { expect } = require("chai");
const sinon = require("sinon");
const request = require("superagent");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Incoming Requests", () => {
  let miniApp;
  beforeEach(() => {
    miniApp = new MiniApplication();
    return miniApp.listen(3000);
  });

  it("should track all incoming requests, even resulting in 404", (done) => {
    request.get("http://localhost:3000/test")
      .end((err, res) => {
        const lastReq = miniApp.requests.get("incoming.0").value();
        expect(lastReq.url).to.equal("/test");
        expect(res.statusCode).to.equal(404);
        done();
      });
  });

  afterEach(() => miniApp.close());
});
