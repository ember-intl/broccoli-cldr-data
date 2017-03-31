'use strict';

const vm = require('vm');
const assert = require('assert');
const testHelpers = require('broccoli-test-helper');

const BroccoliPlugin = require('..');

const createBuilder = testHelpers.createBuilder;
const createTempDir = testHelpers.createTempDir;

function run(code) {
  let script = new vm.Script(code);

  return script.runInContext(
    vm.createContext({
      module: Object.create(null)
    })
  );
}

describe('cldr data extraction', function() {
  beforeEach(function() {
    this.build = pluginOptions => {
      return createTempDir().then(input => {
        this._input = input;

        this._output = createBuilder(
          new BroccoliPlugin(
            [input.path()],
            Object.assign(
              {
                pluralRules: false,
                relativeFields: false,
                moduleType: 'commonjs'
              },
              pluginOptions
            )
          )
        );

        return this._output.build().then(() => this._output.read()).catch(e => {
          console.error(e);
          throw e;
        });
      });
    };
  });

  afterEach(function() {
    this._output.dispose();
    this._input.dispose();
  });

  it('filenames should be the locale', function() {
    return this.build().then(result => {
      assert.ok(result['en.js']);
      assert.ok(result['zh.js']);
    });
  });

  it('should have object values for each locale key', function() {
    return this.build().then(result => {
      assert.equal(typeof run(result['en.js']), 'object');
      assert.equal(typeof run(result['zh.js']), 'object');
    });
  });

  it('should treat locales as case insensitive', function() {
    return this.build({
      locales: ['EN-ca', 'fr-CA'],
      pluralRules: true
    }).then(result => {
      assert.equal(Object.keys(result).length, 2);
      let en = run(result['en.js']);
      let en_CA = en.find(l => l.locale === 'en-CA');
      assert.ok(en_CA);
    });
  });

  it('should treat locales as case insensitive', function(done) {
    this.build({
      locales: [false]
    }).catch(e => {
      assert.equal(e.name, 'AssertionError');
      assert.equal(e.message, 'Locale false was provided, but a string was expected.');
      done();
    });
  });

  it('should treat handle underscored locales', function() {
    return this.build({
      locales: ['en_CA', 'fr_ca'],
      pluralRules: true
    }).then(result => {
      assert.equal(Object.keys(result).length, 2, 'contains only fr and en modules');
      let en = run(result['en.js']);
      let en_CA = en.find(l => l.locale === 'en-CA');
      assert.ok(en_CA);
    });
  });

  it('should include pluralRuleFunction function when pluralRules enabled', function() {
    return this.build({
      locales: ['en-ca', 'fr-ca'],
      pluralRules: true
    }).then(result => {
      assert.equal(Object.keys(result).length, 2, 'contains only fr and en modules');
      let en = run(result['en.js']);
      assert.ok(en.find(locale => typeof locale.pluralRuleFunction === 'function'));
    });
  });

  it('should not include pluralRuleFunction function when pluralRules disabled', function() {
    return this.build().then(result => {
      let en = run(result['en.js']);
      assert.equal(typeof en[0].pluralRuleFunction, 'undefined');
    });
  });
});
