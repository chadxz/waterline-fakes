'use strict';
var sinon = require('sinon');
var _ = require('lodash');

/**
 * Creates an object that mimics the structure of a Waterline model. The constructed model will possess any properties
 * passed in the options `props` property. It will also have two pre-stubbed methods, `destroy()` and `save()`. The
 * values passed to the callback are determined by the options passed into this method.
 *
 * @param {object} [options]
 * @param {object} [options.props={}] Any properties to be made available as properties of the fake model
 * @param {object} [options.destroy]
 * @param {*} [options.destroy.err=null] The error value to call the destroy callback with
 * @param {object} [options.save]
 * @param {*} [options.save.err=null] The error value to call the save callback with
 * @param {*} [options.save.result=this] The result value to call the save callback with. Defaults to the constructed
 *  model.
 * @returns {{destroy: Function, save: Function}}
 */
exports.fakeWaterlineModel = function (options) {
  options = options || {};

  var fakeModel = {
    destroy: function () {},
    save: function () {}
  };

  if (options && options.props) {
    _.assign(fakeModel, options.props);
  }

  sinon.stub(fakeModel, 'destroy', function (callback) {
    var err = _.has(options, 'destroy.err') ? options.destroy.err : null;
    process.nextTick(function () {
      callback(err);
    });
  });

  sinon.stub(fakeModel, 'save', function (callback) {
    var err = _.has(options, 'save.err') ? options.save.err : null;
    var result;

    if (!err && _.has(options, 'save.result')) {
      result = options.save.result;
    } else {
      // by default, resolve to myself if err not specified
      result = err ? null : fakeModel;
    }

    process.nextTick(function () {
      callback(err, result);
    });
  });

  return fakeModel;
};

/**
 * Creates a function that can be used to 'stub' a Waterline collection method. The passed options determine what values
 * should be passed to the `.exec()` callback when it is called on the resulting object.
 *
 * @param {object} [options]
 * @param {*} [options.err=null] The error value to be passed to the exec callback
 * @param {*} [options.result=[]] The result value to be passed to the exec callback
 * @returns {Function}
 */
exports.fakeWaterlineChainMethod = function (options) {
  options = options || {};

  var err = _.has(options, 'err') ? options.err : null;
  var result;

  if (!err && _.has(options, 'result')) {
    result = options.result;
  } else {
    result = err ? null : [];
  }

  return function () {
    return {
      exec: function (callback) {
        process.nextTick(function () {
          callback(err, result);
        });
      }
    };
  };
};
