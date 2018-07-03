const { expect } = require("chai");
const request = require("superagent");

const MiniApplication = require("../src/mini-application");

describe("Mini Application reset", () => {
  let miniApp;
  beforeEach(() => {
    miniApp = new MiniApplication();
    return miniApp.listen(3000);
  });

  it("should allow to reset sinon behavior and history", () => {
    miniApp.stubApp("/test").respond({ foo: "bar" });
    return request.get("http://localhost:3000/test")
      .then((res) => {
        const lastReq = miniApp.requests.get("incoming.0").value();
        expect(lastReq.url).to.equal("/test");
        expect(res.statusCode).to.equal(200);
      })
      .then(() => {
        miniApp.reset();
        return request.get("http://localhost:3000/test")
          .catch((err) => {
            const incomingRequests = miniApp.requests.get("incoming").value();
            expect(incomingRequests.length).to.equal(1);
            expect(incomingRequests[0].url).to.equal("/test");
            expect(err.response.statusCode).to.equal(404);
          });
      });
  });

  afterEach(() => miniApp.close());
});
