exports.head = function head(module) {
  // Add generally used modules
  module.assert = require("assert");

  // Initialize the test module
  module.browser = require("ui/browser").get();
}

