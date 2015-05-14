# waterline-fakes

Utilities to make it easier to fake out waterline models and collections for unit testing.

## description

When unit testing controllers or services in Sails.js, it can be helpful to replace model and collection interaction
results with fake results, so that you're only testing the one layer of your code that you are focusing on. This package
exposes some factories to generate objects and methods that would take the place of normal Sails model or collection
methods.

## install

```bash
npm i --save-dev waterline-fakes
```

## api

```js
var waterlineFakes = require('waterline-fakes');
/* => {
  fakeWaterlineChainMethod: function () {},
  fakeWaterlineModel: function () {}
} */


```

### using fakeWaterlineChainMethod(options)

Used to replace a method on a Collection, that would normally be followed by a call to
`.exec(function (err, results)) {}`. A normal block of code that you would want to test may look something like this:

```js
// GET /pets
list: function (req, res) {
  Pets.find(req.query).exec(function (err, pets) {
      if (err) {
        res.send(500, { error: 'internal server error' });
        return;
      }

      res.send(200, pets);
  });
}
```

To test the error condition of this controller action using `mocha`, you could do something like this:

```js
var req = require('supertest');
var sinon = require('sinon');
var expect = require('chai').expect;
var fakeWaterlineChainMethod = require('waterline-fakes').fakeWaterlineChainMethod;

describe('the list method', function () {

  describe('when an error occurs looking up the pets', function () {

    beforeEach(function () {
      sinon.stub(Pets, 'find', fakeWaterlineChainMethod({
        err: new Error('boom');
      }));
    });

    it('returns 500 status code and error json', function (done) {
      req(sails.hooks.http.server)
        .get('/pets')
        .expect(500)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          expect(err).to.not.exist();
          expect(res.body).to.deep.equal({
            error: 'internal server error'
          });
          done();
        });

    });
  });
});
```

#### fakeWaterlineChainMethod api

```js
var fakeWaterlineChainMethod = require('waterline-fakes').fakeWaterlineChainMethod;
var fakeMethod = fakeWaterlineChainMethod({
  err: {}, // Default: null. The error value you want the exec callback to be called with
  result: {} // Default: []. The result value you want the exec callback to be called with
});
// if you pass both err and result, the err will take precedence. so... don't do that.
```

### using fakeWaterlineModel(options)

Used to simulate an actual Waterline model, if your controller or service code interacts with the model directly. This
is usually passed as the `result` option to fakeWaterlineChainMethod when needed.

Take this other example controller action:

```js
// PUT /pets/:id
update: function (req, res) {
  Pets.findOneById(req.params.id).exec(function (err, pet) {
    if (err) {
      res.send(500, { error: 'internal server error' });
      return;
    }

    if (!pet) {
      res.send(404, { error: 'not found' });
      return;
    }

    pet.name = req.body.name;
    pet.color = req.body.color;
    pet.type = req.body.type;
    pet.save(function (err, updatedPet) {
      if (err) {
        res.send(500, { error: 'internal server error' });
        return;
      }

      res.send(200, updatedPet);
    };
  });
}
```

You could test the error condition of the `pet.save()` using the following `mocha` test:

```js
var req = require('supertest');
var sinon = require('sinon');
var expect = require('chai').expect;
var waterlineFakes = require('waterline-fakes');
var fakeWaterlineChainMethod = waterlineFakes.fakeWaterlineChainMethod;
var fakeWaterlineModel = waterlineFakes.fakeWaterlineModel;

describe('the update method', function () {

  describe('when an error occurs while saving the updated pet', function () {

    beforeEach(function () {
      var fakePet = fakeWaterlineModel({
        save: { err: new Error('boom') }
      });

      sinon.stub(Pets, 'findOneById', fakeWaterlineChainMethod({ result: fakePet }));
    });

    it('returns 500 status code and error json', function (done) {
      req(sails.hooks.http.server)
        .put('/pets/foo')
        .send({
          name: 'Lenny',
          type: 'golden retriever',
          color: 'champagne'
        }).expect(500)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          expect(err).to.not.exist();
          expect(res.body).to.deep.equal({
            error: 'internal server error'
          });
          done();
        });
    });
  });
});
```

#### fakeWaterlineModel api

```js
var fakeWaterlineModel = require('waterline-fakes').fakeWaterlineModel;
var fakeModel = fakeWaterlineModel({
  props: {}, // properties you want the model to have. would be available at, for example, model.foo
  destroy: {
    err: {} // Default: null. The error value you want the destroy callback to be called with
  },
  save: {
    err: {}, // Default: null. The error value you want the save callback to be called with
    result: {} // Default: model. The result value you want the save callback to be called with.
  }
});
// if you pass both err and result, the err will take precedence. so... don't do that.
```


## contributing

To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md)

## license

[MIT](LICENSE.txt)
