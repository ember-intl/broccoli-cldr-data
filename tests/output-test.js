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
    build().then(function(result) {
      var ls = walkSync(result.directory);
      assert.ok(~ls.indexOf('en.js'));
      assert.ok(~ls.indexOf('zh.js'));
      done();
    });
  });

  it('should have object values for each locale key', function(done) {
    build().then(function(result) {
      var en = require(path.join(result.directory, 'en.js'));
      var zh = require(path.join(result.directory, 'zh.js'));
      assert.equal(typeof en, 'object');
      assert.equal(typeof zh, 'object');
      done();
    });
  });

  it('should treat locales as case insensitive', function(done) {
    build({
      locales: ['EN-ca', 'fr-CA'],
      pluralRules: true
    }).then(function(result) {
      var outputPath = result.directory;
      var ls = walkSync(outputPath);
      assert.equal(ls.length, 2, 'contains only fr and en modules');

      var en = require(path.join(outputPath, 'en.js'));
      var enCA = en.find(function(l) {
        return l.locale === 'en-CA';
      });

      assert.ok(enCA);

      done();
    });
  });

  it('should treat locales as case insensitive', function(done) {
    try {
      build({ locales: [false] });
    } catch(e) {
      assert.equal(e.name, 'AssertionError');
      assert.equal(e.message, 'Locale false was provided, but a string was expected.');
      done();
    }
  });

  it('should treat handle underscored locales', function(done) {
    build({
      locales: ['en_CA', 'fr_ca'],
      pluralRules: true
    }).then(function(result) {
      var outputPath = result.directory;
      var ls = walkSync(outputPath);
      assert.equal(ls.length, 2, 'contains only fr and en modules');

      var en = require(path.join(outputPath, 'en.js'));
      var enCA = en.find(function(l) {
        return l.locale === 'en-CA';
      });

      assert.ok(enCA);

      done();
    });
  });

  it('should include pluralRuleFunction function when pluralRules enabled', function(done) {
    build({
      locales: ['en-ca', 'fr-ca'],
      pluralRules: true
    }).then(function(result) {
      var outputPath = result.directory;
      var ls = walkSync(outputPath);
      assert.equal(ls.length, 2, 'contains only fr and en modules');

      var en = require(path.join(outputPath, 'en.js'));

      assert.ok(en.find(function(locale) {
        return typeof locale.pluralRuleFunction === 'function';
      }));

      done();
    });
  });

  it('should not include pluralRuleFunction function when pluralRules disabled', function(done) {
    build().then(function(result) {
      var en = require(path.join(result.directory, 'en.js'));
      assert.equal(typeof en[0].pluralRuleFunction, 'undefined');
      done();
    });
  });
});
