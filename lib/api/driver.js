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
 * @namespace Defines the Mozmill driver for global actions
 */
var driver = exports;


// Include necessary modules
var errors = require('errors');
var services = require('../services');
var stack = require('stack');
var windows = require('../ui/windows');


/**
 * Gets the top most browser window
 *
 * @memberOf driver
 * @returns {windows.Window}
 */
function getBrowserWindow() {
  let win = getMostRecentWindow(windows.filterWindowByType, "navigator:browser");
  let browser = null;

  if (win)
    browser = new windows.ChromeWindowWrapper(win);
  else
    browser = openBrowserWindow();

  browser.mixin(require('../mixins/browser').BrowserMixin);
  return browser;
}


/**
 * Opens a new browser window
 *
 * @memberOf driver
 * @returns {windows.Window}
 */
function openBrowserWindow() {
  let hWindow = Cc["@mozilla.org/appshell/appShellService;1"].
                getService(Ci.nsIAppShellService).
                hiddenDOMWindow;
  return new windows.ChromeWindowWrapper(hWindow.OpenBrowserWindow());
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

    throw new errors.TimeoutError(aMessage, filename, frame.lineNumber, frame.name);
  }
}



/**
 * Internal method to retrieve a DOM window by a given sorting order and type.
 *
 * @private
 * @param {Function} aWindowCallback Function which retrieves a list of windows.
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Object} [aValue] Value to pass to the filter function.
 *
 * @returns {DOMWindow} The window found.
 */
function _getWindow(aWindowCallback, aFilterCallback, aValue) {
  let windows;

  if (aFilterCallback) {
    windows = aWindowCallback(function (window) {
      return aFilterCallback(window, aValue);
    });
  }
  else {
    windows = aWindowCallback();
  }

  return windows.length ? windows[0] : null;
}


/**
 * Internal method to retrieve a list of DOM windows by a given sorting order
 * and filter.
 *
 * @private
 * @param {nsISimpleEnumerator} aEnumerator Window enumerator to use.
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 *
 * @returns {DOMWindow[]} The windows found.
 */
function _getWindows(aEnumerator, aFilterCallback) {
  let windows = [];

  while (aEnumerator.hasMoreElements()) {
    let window = aEnumerator.getNext();

    if (!aFilterCallback || aFilterCallback(window)) {
      windows.push(window);
    }
  }

  return windows.reverse();
}


/**
 * Callback to filter entries in a window list by method
 *
 * @param {DOMWindow} aWindow Window to check.
 * @param {String} aName Name of the window.
 *
 * @returns {Boolean} True if the condition is met.
 */
function filterWindowByMethod(aWindow, aName) {
  return (aName in aWindow);
}


/**
 * Callback to filter entries in a window list by window title
 *
 * @param {DOMWindow} aWindow Window to check.
 * @param {String} aTitle Title of the window.
 *
 * @returns {Boolean} True if the condition is met.
 */
function filterWindowByTitle(aWindow, aTitle) {
  return (aWindow.document.title === aTitle);
}


/**
 * Callback to filter entries in a window list by window type
 *
 * @param {DOMWindow} aWindow Window to check.
 * @param {String} aType Type of the window.
 *
 * @returns {Boolean} True if the condition is met.
 */
function filterWindowByType(aWindow, aType) {
  return (aWindow.document.documentElement.getAttribute("windowtype") === aType);
}


/**
 * Retrieves a sorted list of open windows based on their age (newest to oldest).
 *
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 *
 * @returns {DOMWindow[]} List of windows.
 */
function getLastOpenedWindows(aFilterCallback) {
  return _getWindows(services.wm.getEnumerator(""), aFilterCallback);
}


/**
 * Retrieves a sorted list of open windows based on their z order (most recent first).
 *
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 *
 * @returns {DOMWindow[]} List of windows.
 */
function getMostRecentWindows(aFilterCallback) {
  return _getWindows(services.wm.getZOrderDOMWindowEnumerator("", false),
                     aFilterCallback);
}


/**
 * Retrieves the last opened window.
 *
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Object} [aValue] Value to pass to the filter function.
 *
 * @returns {DOMWindow} The window.
 */
function getLastOpenedWindow(aFilterCallback, aValue) {
  return _getWindow(getLastOpenedWindows, aFilterCallback, aValue);
}

/**
 * Retrieves the most recent window.
 *
 * @param {Function} [aFilterCallback] Function which is used to filter windows.
 * @param {Object} [aValue] Value to pass to the filter function.
 *
 * @returns {DOMWindow} The window.
 */
function getMostRecentWindow(aFilterCallback, aValue) {
  return _getWindow(getMostRecentWindows, aFilterCallback, aValue);
}


// Export of functions
driver.getBrowserWindow = getBrowserWindow;
driver.openBrowserWindow = openBrowserWindow;
driver.sleep = sleep;
driver.waitFor = waitFor;

driver.filterWindowByMethod = filterWindowByMethod;
driver.filterWindowByTitle = filterWindowByTitle;
driver.filterWindowByType = filterWindowByType;

driver.getLastOpenedWindow = getLastOpenedWindow;
driver.getLastOpenedWindows = getLastOpenedWindows;
driver.getMostRecentWindow = getMostRecentWindow;
driver.getMostRecentWindows = getMostRecentWindows;
