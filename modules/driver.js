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
 * @name driver
 * @namespace Defines the Mozmill driver for global actions
 */
var driver = exports;


// Include necessary modules
const { TimeoutError } = require('errors');
var stackUtils = require('stack');


/**
 * Pause the test execution for the given amount of time
 *
 * @memberOf driver
 * @param {Number} aTimeout Time in milliseconds to wait
 */
function sleep(aTimeout) {
  mozmill.utils.sleep(aTimeout);
}

/**
 * Wait until the given condition via the callback returns true.
 *
 * @memberOf driver
 * @param {Function} aCallback Callback which has to return true for a pass
 * @param {String} [aMessage] Message to use if a timeout occurs
 * @param {Number} [aTimeout=5000] Number of milliseconds until a timeout occurs
 * @param {Number} [aInterval=100] Number of milliseconds between each iteration
 * @param {Object} [aThisObject] Reference to the object this references
 * @throws {TimeoutError}
 */
function waitFor(aCallback, aMessage, aTimeout, aInterval, aThisObject) {
  // XXX Bug 637941
  // Until Mozmill doesn't throw a distinct error for timeouts we have to
  // catch the exception and throw it again, if it's a timeout error. We also
  // can't pass the message to the waitFor method.
  try {
    mozmill.utils.waitFor(aCallback, null, aTimeout, aInterval, aThisObject);
  }
  catch (ex if ex.message.match(/Timeout exceeded for/)) {
    let frame = stackUtils.findCallerFrame(Components.stack);
    let filename = frame.filename.replace(/(.*)-> /, "");

    throw new TimeoutError(aMessage, filename, frame.lineNumber, frame.name);
  }
}


// Export of functions
driver.sleep = sleep;
driver.waitFor = waitFor;
