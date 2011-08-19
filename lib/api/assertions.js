/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <mail@hskupin.info> (Original Author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * @namespace Defines expect and assert methods to be used for assertions.
 */
var assertions = exports;


// Include necessary modules
var errors = require('errors');
var inheritance = require("inheritance");
var stack = require('stack');


// Use the frame module of Mozmill to raise non-fatal failures
var mozmillFrame = {};
Cu.import('resource://mozmill/modules/frame.js', mozmillFrame);


/**
 * The Expect class implements non-fatal assertions, and can be used in cases
 * when a failing test shouldn't abort the current test function. That allows
 * to execute multiple tests in a row.
 *
 * @class Base class for non-fatal assertions
 */
function Expect() {
}

/**
 * Log a test as failing by adding a fail frame.
 *
 * @private
 * @param {Object} aResult Test result details used for reporting.
 * @param {String} aResult.fileName Name of the file in which the assertion failed.
 * @param {String} aResult.function Function in which the assertion failed.
 * @param {Number} aResult.lineNumber Line number of the file in which the assertion failed.
 * @param {String} aResult.message Message why the assertion failed.
 */
Expect.prototype._logFail = function Expect__logFail(aResult) {
  mozmillFrame.events.fail({fail: aResult});
}

/**
 * Log a test as passing by adding a pass frame.
 *
 * @private
 * @param {Object} aResult Test result details used for reporting.
 * @param {String} aResult.fileName Name of the file in which the assertion failed.
 * @param {String} aResult.function Function in which the assertion failed.
 * @param {Number} aResult.lineNumber Line number of the file in which the assertion failed.
 * @param {String} aResult.message Message why the assertion failed.
 */
Expect.prototype._logPass = function Expect__logPass(aResult) {
  mozmillFrame.events.pass({pass: aResult});
}

/**
 * Test the condition and mark test as passed or failed
 *
 * @private
 * @param {Boolean} aCondition Condition to test.
 * @param {String} [aMessage] Message to show for the test result
 * @param {String} [aDiagnosis] Diagnose message to show for the test result
 * @returns {Boolean} Result of the test.
 */
Expect.prototype._test = function Expect__test(aCondition, aMessage, aDiagnosis) {
  let diagnosis = aDiagnosis || "";
  let message = aMessage || "";

  if (diagnosis)
    message = message ? message + " - " + diagnosis : diagnosis;

  // Build result data
  let frame = stack.findCallerFrame(Components.stack);

  let result = {
    'fileName'   : frame.filename.replace(/(.*)-> /, ""),
    'lineNumber' : frame.lineNumber,
    'message'    : message
  };

  // Log test result
  if (aCondition)
    this._logPass(result);
  else
    this._logFail(result);

  return aCondition;
}

Expect.prototype._expectedException = function Expect__expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual.name === expected.name) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

/**
 * Tests whether a code block throws the expected exception class.
 * helper for throws() and doesNotThrow()
 * 
 * adapted from node.js's assert._throws()
 * https://github.com/joyent/node/blob/master/lib/assert.js
*/
Expect.prototype._throws = function Expect__throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    return this._test(false, message, 'Missing expected exception');
  }

  if (!shouldThrow && this._expectedException(actual, expected)) {
    return this._test(false, message, 'Got unwanted exception');
  }

  if ((shouldThrow && actual && expected &&
      !this._expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }

  return this._test(true, message);
}

/**
 * Perform an always passing test
 *
 * @param {String} aMessage Message to show for the test result.
 * @returns {Boolean} Always returns true.
 */
Expect.prototype.pass = function Expect_pass(aMessage) {
  return this._test(true, aMessage, undefined);
}

/**
 * Perform an always failing test
 *
 * @param {String} aMessage Message to show for the test result.
 * @returns {Boolean} Always returns false.
 */
Expect.prototype.fail = function Expect_fail(aMessage) {
  return this._test(false, aMessage, undefined);
}

/**
 * Test if the value pass
 *
 * @param {Boolean|String|Number|Object} aValue Value to test.
 * @param {String} aMessage Message to show for the test result.
 * @returns {Boolean} Result of the test.
 */
Expect.prototype.ok = function Expect_ok(aValue, aMessage) {
  let condition = !!aValue;
  let diagnosis = "got '" + aValue + "'";

  return this._test(condition, aMessage, diagnosis);
}

/**
 * Test if both specified values are identical.
 *
 * @param {Boolean|String|Number|Object} aValue Value to test.
 * @param {Boolean|string|number|object} aExpected Value to strictly compare with.
 * @param {String} aMessage Message to show for the test result
 * @returns {Boolean} Result of the test.
 */
Expect.prototype.equal = function Expect_equal(aValue, aExpected, aMessage) {
  let condition = (aValue === aExpected);
  let diagnosis = "got '" + aValue + "', expected '" + aExpected + "'";

  return this._test(condition, aMessage, diagnosis);
}

/**
 * Test if both specified values are not identical.
 *
 * @param {Boolean|String|Number|Object} aValue Value to test.
 * @param {Boolean|string|number|object} aExpected Value to strictly compare with.
 * @param {String} aMessage Message to show for the test result
 * @returns {Boolean} Result of the test.
 */
Expect.prototype.notEqual = function Expect_notEqual(aValue, aExpected, aMessage) {
  let condition = (aValue !== aExpected);
  let diagnosis = "got '" + aValue + "', not expected '" + aExpected + "'";

  return this._test(condition, aMessage, diagnosis);
}

/**
 * Test if the regular expression matches the string.
 *
 * @param {String} aString String to test.
 * @param {RegEx} aRegex Regular expression to use for testing that a match exists.
 * @param {String} aMessage Message to show for the test result
 * @returns {Boolean} Result of the test.
 */
Expect.prototype.match = function Expect_match(aString, aRegex, aMessage) {
  // XXX Bug 634948
  // Regex objects are transformed to strings when evaluated in a sandbox
  // For now lets re-create the regex from its string representation
  let pattern = flags = "";
  try {
    let matches = aRegex.toString().match(/\/(.*)\/(.*)/);

    pattern = matches[1];
    flags = matches[2];
  }
  catch (ex) {
  }

  let regex = new RegExp(pattern, flags);
  let condition = (aString.match(regex) !== null);
  let diagnosis = "'" + regex + "' matches for '" + aString + "'";

  return this._test(condition, aMessage, diagnosis);
}

/**
 * Test if the regular expression does not match the string.
 *
 * @param {String} aString String to test.
 * @param {RegEx} aRegex Regular expression to use for testing that a match does not exist.
 * @param {String} aMessage Message to show for the test result
 * @returns {Boolean} Result of the test.
 */
Expect.prototype.notMatch = function Expect_notMatch(aString, aRegex, aMessage) {
  // XXX Bug 634948
  // Regex objects are transformed to strings when evaluated in a sandbox
  // For now lets re-create the regex from its string representation
  let pattern = flags = "";
  try {
    let matches = aRegex.toString().match(/\/(.*)\/(.*)/);

    pattern = matches[1];
    flags = matches[2];
  }
  catch (ex) {
  }

  let regex = new RegExp(pattern, flags);
  let condition = (aString.match(regex) === null);
  let diagnosis = "'" + regex + "' doesn't match for '" + aString + "'";

  return this._test(condition, aMessage, diagnosis);
}


 /**
   * Test if a code block throws an exception.
   *
   * @param {String} aCallback Function to call to test for an exception.
   * @param {Object} [aExpectedError] The expected error class.
   * @param {String} [aMessage] Message to present if assertion fails.
   * @returns {Boolean} Result of the test.
   */
Expect.prototype.throws = function Expect_throws(aCallback, aExpectedError, aMessage) {
  return this._throws.apply(this, [true].concat(Array.prototype.slice.call(arguments)));
}

/**
 * Test if a code block doesn't throw an exception.
 *
 * @param {String} aCallback Function to call to test for an exception.
 * @param {Object} [aExpectedError] The expected error class.
 * @param {String} [aMessage] Message to present if assertion fails.
 * @returns {Boolean} Result of the test.
 */
Expect.prototype.doesNotThrow = function Expect_doesNotThrow(aCallback, aExpectedError, aMessage) {
  return this._throws.apply(this, [false].concat(Array.prototype.slice.call(arguments)));
}


/**
 * The Assert class implements fatal assertions, and can be used in cases
 * when a failing test has to directly abort the current test function. All
 * remaining tasks will not be performed.
 *
 * @class Base class for fatal assertions
 * @extends assertions.Expect
 * @requires errors.AssertionError
 */
function Assert() {
}

inheritance.extend(Assert, Expect);

/**
 * Log a test as failing by throwing an AssertionException.
 *
 * @private
 * @param {Object} aResult Test result details used for reporting.
 * @param {String} aResult.fileName Name of the file in which the assertion failed.
 * @param {String} aResult.function Function in which the assertion failed.
 * @param {Number} aResult.lineNumber Line number of the file in which the assertion failed.
 * @param {String} aResult.message Message why the assertion failed.
 * @throws {errors.AssertionError }
 */
Assert.prototype._logFail = function Assert__logFail(aResult) {
  throw new errors.AssertionError(aResult.message,
                                  aResult.fileName,
                                  aResult.lineNumber);
}


// Export of classes
assertions.Expect = Expect;
assertions.Assert = Assert;
