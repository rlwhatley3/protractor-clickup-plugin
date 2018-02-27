var clickupReporter = require('./build/protractor-clickup.js').CUReporter;

var testReporter = new clickupReporter();

// console.log('clickup test: ', testReporter);
testReporter.setup();
console.log('done');

module.exports = testReporter;