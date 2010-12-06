/**
 * Basic initialization we want for every test module
 *
 * @param module
 *        Test module to initialize
 */
function testModule(module) {
  // Add generally used modules
  module.assert = require("assert");

  // Initialize the test module
  // XXX: Holding off on adding this until we're sure how we get the browser
  // module.browser = require("ui/browser").get();
}

exports.testModule = testModule;