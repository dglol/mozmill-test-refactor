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

var head = require("../head");
var errors = require("../api/errors");
var l10n = require("../l10n");
var windows = require("../api/windows");

// Grab just the class here so the module doesn't conflict with the default browser.
const {BrowserWindow} = require("../ui/browser");


function setupModule(aModule) {
  head.setup(aModule);
  persisted.windowHandled = false;
}


function teardownModule(aModule) {
  head.teardown(aModule);
  delete persisted.windowHandled;
}


/**
 * Test the window and dialog support
 */
function testChromeWindows() {
  expect.equal(browser.type, "navigator:browser", "Browser window has the correct type.");

  browser.openURL("http://www.google.de");

  // Test handling of new windows without setting a callback
  openBrowserWindow();

  var window2 = browser.findWindow(driver.windowFilterByType("navigator:browser"));
  var browser2 = new BrowserWindow(window2);
  expect.equal(browser2.type, "navigator:browser", "Second browser window has the correct type");
  expect.notEqual(browser2.innerWindow, browser.innerWindow, "Two different browser windows");
  browser2.close();
  expect.equal(driver.getWindowsByAge().length, 1, "A single window is visible.");

  // Test handling of new windows by setting a callback
  var key = l10n.getEntity(["chrome://browser/locale/browser.dtd"], "pageSourceCmd.commandkey");
  browser.ui.navBar.keypress(key, {accelKey: true});

  browser.handleWindow(driver.windowFilterByType("navigator:view-source"), callback);
  expect.equal(persisted.windowHandled, true, "Callback has been correctly processed.");
  expect.equal(driver.getWindowsByAge().length, 1, "A single window is visible.");

  // Test handling of new windows by setting a callback and not closing the window
  persisted.windowHandled = false;
  browser.ui.navBar.keypress(key, {accelKey: true});

  var win = browser.handleWindow(driver.windowFilterByType("navigator:view-source"),
                                 callback, false);
  expect.equal(persisted.windowHandled, true, "Callback has been correctly processed.");
  expect.equal(driver.getWindowsByAge().length, 2, "Two windows are visible.");
  win.close();
}


function callback(aDOMWindow) {
  persisted.windowHandled = true;
}
