const { expect } = require("chai");
const sinon = require("sinon");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Public Api", () => {
  it("should expose a basic set of functions", () => {
    const miniApp = new MiniApplication;

    expect(miniApp.listen).to.be.a("function");
    expect(miniApp.stubApp).to.be.a("function");
    expect(miniApp.close).to.be.a("function");
  });
});
