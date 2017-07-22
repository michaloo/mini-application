const { expect } = require("chai");
const sinon = require("sinon");
const request = require("superagent");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Base Class", () => {
  it("should allow to be extended to include custom logic", (done) => {
    class TestApplication extends MiniApplication {
      constructor(options) {
        super(options);
        this.stubApp("get", "test");
      }
    }
    miniApp = new TestApplication();
    miniApp.listen(3000)
      .then(() => {
        request.get("http://localhost:3000/test").end();
        miniApp.on("incoming.request@GET/test", (req) => {
          expect(req.url).to.be.equal("/test");
          miniApp.close().then(done);
        });
      });
  });
});
