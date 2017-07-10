const { expect } = require("chai");
const sinon = require("sinon");
const request = require("superagent");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Events Emmiter", () => {
  let miniApp;
  beforeEach(() => {
    miniApp = new MiniApplication();
    return miniApp.listen(3000);
  });

  it("should emit events for method and path", (done) => {
    request.get("http://localhost:3000/test").end();
    miniApp.on("incoming.request@GET/test", (req) => {
      expect(req.url).to.be.equal("/test");
      done();
    });
  });

  afterEach(() => miniApp.close());
});
