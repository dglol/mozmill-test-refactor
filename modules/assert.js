// This will get used a lot.
var $ = mozmill.controller;

/**
 * Succeeds if the supplied value is true
 *
 * @param value
 *        Value to test for truth
 * @param message
 *        Message to include with result
 */
function ok(value, message) {
  message = message + " - " + String(value);
  $.assert(function { 
    return value;
  }, message);
}

/**
 * Succeeds if got == expected
 *
 * @param got
 *        Actual value
 * @param expected
 *        Expected value
 * @param message
 *        Message to include with result
 */
function is(got, expected, message) {
  message = message + " - actual: " + String(condition1) + ", expected: " + String(condition2);
  $.assert(function {
    condition1 == condition2
  }, message);
}

// Exported functions
exports.ok = ok;
exports.is = is;