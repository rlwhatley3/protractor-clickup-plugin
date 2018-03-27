var clickupPlugin = require('./build/protractor-clickup.js').CUPlugin;
let plugin = new clickupPlugin;
global.CU = plugin;
module.exports = plugin;






