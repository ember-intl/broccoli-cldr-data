'use strict';

process.chdir(__dirname);

var path = require('path');
var broccoli = require('broccoli');

var plugin = require('../');

module.exports = function (inputTrees, pluginOptions) {
  inputTrees = !Array.isArray(inputTrees) ? [inputTrees] : inputTrees;

  if (!pluginOptions) {
    pluginOptions = {};
  }

  var instance = plugin.apply(this, arguments);

  return new broccoli.Builder(instance).build();
}
