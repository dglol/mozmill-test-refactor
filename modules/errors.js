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
 * @name errors
 * @namespace Defines error classes to be used for exceptions.
 */
var errors = exports;


/**
 * All methods for fatal assertions as implemented in assertions.Assert throw
 * an AssertionError as exception type if a test fails.
 *
 * @class Error class which is used by Assert to raise an assertion exception.
 * @constructor
 * @memberOf errors
 * @see assertions.Assert
 * @param {object} aResult
 *   Test result details used for error reporting.
 *   <dl>
 *     <dd>fileName</dd>
 *     <dt>Name of the file in which the assertion failed.</dt>
 *     <dd>function</dd>
 *     <dt>Function in which the assertion failed.</dt>
 *     <dd>lineNumber</dd>
 *     <dt>Line number of the file in which the assertion failed.</dt>
 *     <dd>message</dd>
 *     <dt>Message why the assertion failed.</dt>
 *   </dl>
 * @returns {AssertionError} Instance of the AssertionError class.
 */
function AssertionError(aResult) {
  let error = Object.create(AssertionError.prototype);

  error.message = aResult.message;
  error.fileName = aResult.fileName;
  error.lineNumber = aResult.lineNumber;
  error.function = aResult.function;

  return error;
}

AssertionError.prototype = Object.create(Error.prototype,
{
  constructor: { value: AssertionError },
  name: { value: "AssertionError" }
});


// Export of classes
errors.AssertionError = AssertionError;
