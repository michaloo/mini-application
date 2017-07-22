const { expect } = require("chai");
const sinon = require("sinon");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Public Api", () => {
  it("should expose a basic set of functions", () => {
    const miniApp = new MiniApplication;

    // stub the express app
    expect(miniApp.stubApp).to.be.a("function");

    // listen for events
    expect(miniApp.on).to.be.a("function");
    expect(miniApp.once).to.be.a("function");

    // start and close the server
    expect(miniApp.listen).to.be.a("function");
    expect(miniApp.close).to.be.a("function");

    // save and load the state
    expect(miniApp.save).to.be.a("function");
    expect(miniApp.load).to.be.a("function");
    expect(miniApp.list).to.be.a("function");

    // perform outgoing request
    expect(miniApp.request).to.be.a("function");
    expect(miniApp.get).to.be.a("function");
    expect(miniApp.post).to.be.a("function");
    expect(miniApp.put).to.be.a("function");
    expect(miniApp.delete).to.be.a("function");
  });
});
