/* jshint node: true */

'use strict';

/**
* Copyright 2015, Yahoo! Inc.
* Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
*/

var CachingWriter = require('broccoli-caching-writer');
var extractor = require('formatjs-extract-cldr-data');
var serialize = require('serialize-javascript');
var mkdirp = require('mkdirp');
var fs = require('fs');

require('./object-assign-polyfill');

Plugin.prototype = Object.create(CachingWriter.prototype);
Plugin.prototype.constructor = Plugin;

function Plugin(inputNodes, options) {
  if (!(this instanceof Plugin)) {
    return new Plugin(inputNodes, options);
  }

  options = options || {};

  CachingWriter.call(this, inputNodes, {
    annotation: options.annotation
  });

  this.destDir = options.destDir || '';
  delete options.destDir;

  this.options = Object.assign({
    locales: null,
    pluralRules: true,
    relativeFields: true,
    prelude: '',
    moduleType: 'es6',
    wrapEntry: function(data) {
      let prefix = 'export default';

      if (this.moduleType === 'commonjs') {
        prefix = 'module.exports =';
      }

      return prefix + ' ' + serialize(data) + ';';
    }
  }, options);
}

Plugin.prototype.build = function() {
  var options = this.options;
  var destPath = this.outputPath + '/' + this.destDir;
  var cldrData = extractor(options);

  var cldrDataByLang = Object.keys(cldrData).reduce(function(map, locale) {
    var data = cldrData[locale];
    var lang = locale.split('-')[0];
    var langData = map[lang] || [];
    map[lang] = langData.concat(data);

    return map;
  }, {});

  mkdirp.sync(destPath);

  Object.keys(cldrDataByLang).forEach(function(lang) {
    var cldrData = cldrDataByLang[lang];

    if (typeof options.wrapEntry === 'function') {
      cldrData = options.wrapEntry(cldrData);
    }

    var outFile = destPath + '/' + lang.toLocaleLowerCase() + '.js';
    fs.writeFileSync(outFile, options.prelude.concat(cldrData), { encoding: 'utf8' });
  });
}

module.exports = Plugin;
