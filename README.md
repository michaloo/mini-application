# Mini Application

Express app and sinon mocks to the rescue!

![CircleCI Status](https://circleci.com/gh/michaloo/mini-application.png)
![CodeCov](https://codecov.io/gh/michaloo/mini-application/branch/master/graph/badge.svg)

## Installation

`npm i mini-application --save`

`yarn add -S mini-application`

```js
const MiniApplication = require("mini-application")
const miniApp = new MiniApplication();
```

## Stub

What happens when you wrap [Express middleware](https://expressjs.com/) with [Sinon stub](http://sinonjs.org/releases/v2.3.7/stubs/)? See below:

### Stub simple endpoint

```js
const MiniApplication = require("mini-application")
const miniApp = new MiniApplication();

miniApp.stubApp("/test").respond((req, res) => {
  res.end("ok!");
});

miniApp.listen(3000)
.then(() => {
  rp.get("http://localhost:3000/test")
    .then((response) => {
      assert(response.body === "ok!");
    });
});
```


### Stub different responses

```js
miniApp.stubApp("/test")
  .onFirstCall()
  .respond((req, res) => res.end("first response"))
  .onSecondCall()
  .respond((req, res) => res.end("second response"));
```

### Stub specific method only

```js
miniApp.stubApp("post", "/test").respond((req, res) => res.end("on post call only"));
```

### Use sinon helper

```js
// respond with json
miniApp.stubApp("/test").respond({ text: "json response" });
// or set the status code
miniApp.stubApp("/test").respond(503);
// or just send a text
miniApp.stubApp("/test").respond("ok");
```

## Events

It's often helpful to get nice callback the verify the expectations


### Simple event emitted for path

```js
request.get("http://localhost:3000/test").end();
miniApp.on("incoming.request@/test", (req) => {
  expect(req.url).to.be.equal("/test");
  done();
});
```

## Interactive

Sometimes it's hard to write a good test without manual verification first. Miniapp should help here too:

```sh
bin/mini-application
miniApp - listening on 3000
miniApp > stubApp("/").respond("ok")
# now open http://localhost:3000/ in the browser to see the response
# then you can inspect all requests which were made to the miniApp instance:
miniApp > requests.get("incoming").value()
```

## Extendable

For easier testing custom logic can be wrapped as a class extending the MiniApplication base:

```js
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
    });
  });
```
