'use strict';

const broccoli = require('broccoli');

const plugin = require('../');

module.exports = function testsBuild() {
  let pluginInstance = plugin.apply(this, arguments);

  return new broccoli.Builder(pluginInstance).build();
}
