'use strict';

const path = require('path');
const assert = require('assert');
const walkSync = require('walk-sync');
const testHelper = require('broccoli-test-helper');

const builder = require('./build');

function build(pluginOptions) {
  return testHelper.createTempDir().then(input => {
    return builder(
      input.path(),
      Object.assign(
        {
          pluralRules: false,
          relativeFields: false,
          numberFields: false,
          moduleType: 'commonjs'
        },
        pluginOptions
      )
    );
  });
}

describe('cldr data extraction', function() {
  it('filenames should be the locale', function() {
    return build().then(result => {
      let ls = walkSync(result.directory);
      assert.ok(~ls.indexOf('en.js'));
      assert.ok(~ls.indexOf('zh.js'));
    });
  });

  it('should have object values for each locale key', function() {
    return build().then(result => {
      let en = require(path.join(result.directory, 'en.js'));
      let zh = require(path.join(result.directory, 'zh.js'));
      assert.equal(typeof en, 'object');
      assert.equal(typeof zh, 'object');
    });
  });

  it('should assert when locale does not appear to be a locale', function(done) {
    try {
      build({ locales: [false] });
      done();
    } catch(e) {
      assert.equal(e.name, 'AssertionError');
      assert.equal(e.message, 'Locale false was provided, but a string was expected.');
    }
  });

  it('should parse underscored locales', function() {
    return build({
      locales: ['en_CA', 'fr_ca'],
      pluralRules: true
    }).then(result => {
      let ls = walkSync(result.directory);
      let en = require(path.join(result.directory, 'en.js'));
      let enCA = en.find(o => o.locale === 'en-CA');
      assert.equal(ls.length, 2, 'contains only fr and en modules');
      assert.ok(enCA);
    });
  });

  it('should parse locales as case insensitive', function() {
    return build({
      locales: ['EN-ca', 'fr-CA'],
      pluralRules: true
    }).then(result => {
      let ls = walkSync(result.directory);
      let en = require(path.join(result.directory, 'en.js'));
      let enCA = en.find(o => o.locale === 'en-CA');
      assert.equal(ls.length, 2, 'contains only fr and en modules');
      assert.ok(enCA);
    });
  });

  it('should include pluralRuleFunction function when pluralRules enabled', function() {
    return build({
      locales: ['en-ca', 'fr-ca'],
      pluralRules: true
    }).then(result => {
      let ls = walkSync(result.directory);
      let en = require(path.join(result.directory, 'en.js'));
      assert.equal(ls.length, 2, 'contains only fr and en modules');
      assert.ok(en.find(locale => typeof locale.pluralRuleFunction === 'function'));
    });
  });

  it('should not include pluralRuleFunction function when pluralRules disabled', function() {
    return build().then(result => {
      let en = require(path.join(result.directory, 'en.js'));
      assert.equal(typeof en[0].pluralRuleFunction, 'undefined');
    });
  });
});
