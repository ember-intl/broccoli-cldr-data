'use strict';

var path = require('path');
var assert = require('assert');
var walkSync = require('walk-sync');

var _build = require('./build');

function build(pluginOptions) {
  return _build(['./empty-test-node'], Object.assign({
    pluralRules: false,
    relativeFields: false,
    moduleType: 'commonjs'
  }, pluginOptions));
}

describe('cldr data extraction', function () {
  it('filenames should be the locale', function (done) {
    build().then((result) => {
      var outputPath = result.directory;
      var ls = walkSync(outputPath);
      assert.ok(ls.includes('en.js'));
      assert.ok(ls.includes('zh.js'));
      done();
    });
  });

  it('should have object values for each locale key', function(done) {
    build().then((result) => {
      var outputPath = result.directory;
      var en = require(path.join(result.directory, 'en.js'));
      var zh = require(path.join(result.directory, 'zh.js'));
      assert.equal(typeof en, 'object');
      assert.equal(typeof zh, 'object');
      done();
    });
  });

  it('should include pluralRuleFunction function when pluralRules enabled', function(done) {
    build({
      pluralRules: true
    }).then((result) => {
      var outputPath = result.directory;
      var en = require(path.join(result.directory, 'en.js'));
      assert.equal(typeof en[0].pluralRuleFunction, 'function');
      done();
    });
  });

  it('should not include pluralRuleFunction function when pluralRules disabled', function(done) {
    build({
      pluralRules: false
    }).then((result) => {
      var outputPath = result.directory;
      var en = require(path.join(result.directory, 'en.js'));
      assert.equal(typeof en[0].pluralRuleFunction, 'undefined');
      done();
    });
  });
});
