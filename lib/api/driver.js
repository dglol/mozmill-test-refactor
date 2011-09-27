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
 *   Geo Mealer <gmealer@mozilla.com>
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
 * @namespace Defines the Mozmill driver for global actions
 */
var driver = exports;


// Include necessary modules
var errors = require('errors');
var services = require('../services');
var stack = require('stack');


/**
 * Gets the topmost browser window. If there are none at that time, optionally
 * opens one. Otherwise will raise an exception if none are found.
 *
 * @memberOf driver
 * @param {Boolean} [aOpenIfNone=true] Open a new browser window if none are found.
 * @returns {DOMWindow}
 */
function getBrowserWindow(aOpenIfNone) {
  // Set default
  if (typeof aOpenIfNone === 'undefined') {
    aOpenIfNone = true;
  }

  // If implicit open is off, turn on strict checking, and vice versa.
  let win = getTopmostWindowByType("navigator:browser", !aOpenIfNone);

  // Can just assume automatic open here. If we didn't want it and nothing found,
  // we already raised above when getTopmostWindow was called.
  if (!win)
    win = openBrowserWindow();

  return win;
}


/**
 * Retrieves the hidden window on OS X
 *
 * @memberOf driver
 * @returns {DOMWindow} The hidden window
 */
function getHiddenWindow() {
  return Cc["@mozilla.org/appshell/appShellService;1"].
            getService(Ci.nsIAppShellService).
            hiddenDOMWindow;
}


/**
 * Opens a new browser window
 *
 * @memberOf driver
 * @returns {DOMWindow}
 */
function openBrowserWindow() {
  // On OS X we have to be able to create a new browser window even with no other
  // window open. Therefore we have to use the hidden window. On other platforms
  // at least one remaining browser window has to exist.
  var win = mozmill.isMac ? getHiddenWindow() :
                            getTopmostWindowByType("navigator:browser", true);
  return win.OpenBrowserWindow();
}


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
 * @throws {errors.TimeoutError}
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
    let frame = stack.findCallerFrame(Components.stack);
    let filename = frame.filename.replace(/(.*)-> /, "");

    throw new errors.TimeoutError(aMessage, filename, frame.lineNumber);
  }
}

//
// INTERNAL WINDOW ENUMERATIONS
//

/**
 * Internal function to build a list of DOM windows using a given enumerator
 * and filter.
 *
 * @private
 * @memberOf driver
 * @param {nsISimpleEnumerator} aEnumerator Window enumerator to use.
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Boolean} [aStrict=true] Throw an error if no windows found
 *
 * @returns {DOMWindow[]} The windows found, in the same order as the enumerator.
 */
function _getWindows(aEnumerator, aFilterCallback, aStrict) {
  // Set default
  if (typeof aStrict === 'undefined')
    aStrict = true;

  let windows = [];

  while (aEnumerator.hasMoreElements()) {
    let window = aEnumerator.getNext();

    if (!aFilterCallback || aFilterCallback(window)) {
      windows.push(window);
    }
  }

  // If this list is empty and we're strict, throw an error
  if (windows.length === 0 && aStrict) {
    var message = 'No windows were found';

    // We'll throw a more detailed error if a filter was used.
    if (aFilterCallback && aFilterCallback.name)
      message += ' using filter "' + aFilterCallback.name + '"';

    throw new errors.UnexpectedError(message);
  }

  return windows;
}

//
// FILTER CALLBACKS
//

/**
 * Generator of a closure to filter a window based by a method
 *
 * @memberOf driver
 * @param {String} aName Name of the method in the window object.
 *
 * @returns {Boolean} True if the condition is met.
 */
function windowFilterByMethod(aName) {
  return function byMethod(aWindow) { return (aName in aWindow); }
}


/**
 * Generator of a closure to filter a window based by the its title
 *
 * @memberOf driver
 * @param {String} aTitle Title of the window.
 *
 * @returns {Boolean} True if the condition is met.
 */
function windowFilterByTitle(aTitle) {
  return function byTitle(aWindow) { return (aWindow.document.title === aTitle); }
}


/**
 * Generator of a closure to filter a window based by the its type
 *
 * @memberOf driver
 * @param {String} aType Type of the window.
 *
 * @returns {Boolean} True if the condition is met.
 */
function windowFilterByType(aType) {
  return function byType(aWindow) {
           var type = aWindow.document.documentElement.getAttribute("windowtype");
           return (type === aType);
         }
}


//
// WINDOW LIST RETRIEVAL FUNCTIONS
//

/**
 * Retrieves a sorted list of open windows based on their age (newest to oldest),
 * optionally matching filter criteria.
 *
 * @memberOf driver
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Boolean} [aStrict=true] Throw an error if no windows found
 *
 * @returns {DOMWindow[]} List of windows.
 */
function getWindowsByAge(aFilterCallback, aStrict) {
  var windows = _getWindows(services.wm.getEnumerator(""),
                            aFilterCallback, aStrict);

  // Reverse the list, since naturally comes back old->new
  return windows.reverse();
}


/**
 * Retrieves a sorted list of open windows based on their z order (topmost first),
 * optionally matching filter criteria.
 *
 * @memberOf driver
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Boolean} [aStrict=true] Throw an error if no windows found
 *
 * @returns {DOMWindow[]} List of windows.
 */
function getWindowsByZOrder(aFilterCallback, aStrict) {
  return _getWindows(services.wm.getZOrderDOMWindowEnumerator("", true),
                     aFilterCallback, aStrict);
}

//
// SINGLE WINDOW RETRIEVAL FUNCTIONS
//

/**
 * Retrieves the last opened window, optionally matching filter criteria.
 *
 * @memberOf driver
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Boolean} [aStrict=true] If true, throws error if no window found.
 *
 * @returns {DOMWindow} The window, or null if none found and aStrict == false
 */
function getNewestWindow(aFilterCallback, aStrict) {
  var windows = getWindowsByAge(aFilterCallback, aStrict);
  return windows.length ? windows[0] : null;
}


/**
 * Retrieves the topmost window, optionally matching filter criteria.
 *
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Boolean} [aStrict=true] If true, throws error if no window found.
 *
 * @returns {DOMWindow} The window, or null if none found and aStrict == false
 */
function getTopmostWindow(aFilterCallback, aStrict) {
  var windows = getWindowsByZOrder(aFilterCallback, aStrict);
  return windows.length ? windows[0] : null;
}


/**
 * Retrieves the topmost window given by the window type
 *
 * XXX: Bug 462222
 *      This function has to be used instead of getTopmostWindow until the
 *      underlying platform bug has been fixed.
 *
 * @memberOf driver
 * @param {String} [aWindowType=null] Window type to query for
 * @param {Boolean} [aStrict=true] Throw an error if no windows found
 *
 * @returns {DOMWindow} The window, or null if none found and aStrict == false
 */
function getTopmostWindowByType(aWindowType, aStrict) {
  // var windows = getWindowsByZOrder(aFilterCallback, aStrict);
  // return windows.length ? windows[0] : null;

  // Set default
  if (typeof aStrict === 'undefined')
    aStrict = true;

  var win = services.wm.getMostRecentWindow(aWindowType);

  if (win === null && aStrict) {
    var message = 'No windows of type "' + aWindowType + '" were found';
    throw new errors.UnexpectedError(message);
  }

  return win;
}


// Export of functions
driver.getBrowserWindow = getBrowserWindow;
driver.getHiddenWindow = getHiddenWindow;
driver.openBrowserWindow = openBrowserWindow;
driver.sleep = sleep;
driver.waitFor = waitFor;

driver.windowFilterByMethod = windowFilterByMethod;
driver.windowFilterByTitle = windowFilterByTitle;
driver.windowFilterByType = windowFilterByType;

driver.getWindowsByAge = getWindowsByAge;
driver.getNewestWindow = getNewestWindow;
driver.getTopmostWindowByType = getTopmostWindowByType;


// XXX Bug: 462222
//     Currently those functions cannot be used. So they shouldn't be exported.
//driver.getWindowsByZOrder = getWindowsByZOrder;
//driver.getTopmostWindow = getTopmostWindow;
