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
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <mail@hskupin.info>
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


// Include necessary modules
var assertions = require("api/assertions");
var places = require("api/places");


/**
 * @namespace Helper methods for the general setup and teardown logic of tests
 *            and methods
 */
var head = exports;

/**
 * @name module
 * @namespace Augmented features into the Mozmill module scope
 */


/**
 * Basic setup function for tests.
 *
 * @memberOf head
 * @param {object} aModule
 *        Test module to initialize
 * @param {boolean} [aResetTabs=true]
 *        Reset the tabs to about:blank. Disable for tests that count on the
 *        startup page set.
 */
function setup(aModule, aResetTabs) {
  if (aResetTabs === undefined)
    aResetTabs = true;

  /**
   * The Mozmill driver for handling global actions
   *
   * @name driver
   * @type driver
   * @memberOf module
   */
  aModule.driver = require("api/driver");

  /**
   * Instance of the Assert class to execute tests with fatal assertions
   *
   * @name assert
   * @type assertions.Assert
   * @memberOf module
   */
  aModule.assert = new assertions.Assert();

  /**
   * Instance of the Expect class to execute tests with non-fatal assertions
   *
   * @name expect
   * @type assertions.Expect
   * @memberOf module
   */
  aModule.expect = new assertions.Expect();

  /**
   * Helper method to get the top-most browser window.
   *
   * @name getBrowserWindow
   * @type browser.getBrowserWindow
   * @memberOf module
   */
  aModule.getBrowserWindow = require("ui/browser").getBrowserWindow;

  /**
   * Helper method to open a new browser window.
   *
   * @name openBrowserWindow
   * @type browser.openBrowserWindow
   * @memberOf module
   */
  aModule.openBrowserWindow = require("ui/browser").openBrowserWindow;

  /**
   * Get the default browser window or create a new one.
   */
  aModule.browser = aModule.getBrowserWindow();

  // Set tabs to known state before the test. This is necessary as the first
  // launch will launch with startup pages, the rest won't have them. This can
  // be skipped for tests that depend on the startup set (presumably restart tests)
  if (aResetTabs)
    aModule.browser.resetTabs();

  // Restore default bookmarks before the test in case last didn't tear down right.
  // This is documented in places.js as a longish operation, but seems very
  // short in practice. If this becomes too much a drag, it can be removed with some risk.
  //places.restoreDefaultBookmarks();

  // Remove all history before the test in case last didn't tear down up right
  //places.removeAllHistory();
}


/**
 * Basic teardown function for tests.
 *
 * @memberOf head
 * @param {object} aModule
 *        Test module to teardown
 */
function teardown(aModule) {
  // Remove all history after the test
  places.removeAllHistory();

  // Restore the default bookmarks after the test
  places.restoreDefaultBookmarks();

  // Reset tabs to known state after the test
  aModule.browser.resetTabs();

  // Clean-up the open browser window (i.e. modal observer)
  aModule.browser.destroy();
}


// Export of methods
head.setup = setup;
head.teardown = teardown;
