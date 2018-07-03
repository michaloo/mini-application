const fs = require("fs");
const { expect } = require("chai");

const MiniApplication = require("../src/mini-application");

describe("Mini Application Interactive", () => {
  let miniApp;
  process.chdir("/tmp");
  beforeEach(() => {
    miniApp = new MiniApplication();
    return miniApp.listen(3000);
  });

  it("should allow to save state", () => {
    miniApp.db.setState({ foo: "bar" });
    miniApp.save("test");
    expect(fs.readFileSync("./test.mini-app.json", "utf-8")).to.be.equal("{\"foo\":\"bar\"}");
  });

  it("should allow to load state", () => {
    fs.writeFileSync("./test2.mini-app.json", "{\"foo\":\"bar\"}");
    miniApp.load("test2");
    expect(miniApp.db.getState()).to.eql({ foo: "bar" });
  });

  it("should allow to list files", () => {
    expect(miniApp.list()).to.eql(["test", "test2"]);
  });

  afterEach(() => miniApp.close());
});
