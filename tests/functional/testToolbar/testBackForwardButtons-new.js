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
 * The Original Code is Mozmill Test Code.
 *
 * The Initial Developer of the Original Code is Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Aakash Desai <adesai@mozilla.com>
 *   Henrik Skupin <hskupin@mozilla.com>
 *   Aaron Train <atrain@mozilla.com>
 *   Geo Mealer <gmealer@mozilla.com>
 *   Owen Coutts <ocoutts@mozilla.com>
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

// See bottom of file for notes about changes I did to help make the test clearer.

// GLOBALS

var head = require("../../../lib/head");
var widgets = require("../../../lib/ui/widgets");

const BASE_URL = collector.addHttpResource('../../../data/');
const TEST_PAGES = [{url: BASE_URL + 'layout/mozilla.html', id: 'community'},
                    {url: BASE_URL + 'layout/mozilla_mission.html', id: 'mission_statement'},
                    {url: BASE_URL + 'layout/mozilla_grants.html', id: 'accessibility'}];

// TEST

function setupModule(aModule) {
  head.setup(aModule);

  // Open all the pages in turn. This will leave us on TEST_PAGES[2].
  TEST_PAGES.forEach(function (page) {
    openPage(page);
  });
}

/**
 * Test the back and forward buttons
 */
function testBackAndForward() {
  // Click on the Back button and verify where we land; we start on TEST_PAGES[2]
  clickBackAndVerify(TEST_PAGES[1]);
  clickBackAndVerify(TEST_PAGES[0]);

  // Click on the Forward button and verify where we land; we start on TEST_PAGES[0]
  clickForwardAndVerify(TEST_PAGES[1]);
  clickForwardAndVerify(TEST_PAGES[2]);
}

function teardownModule(aModule) {
  head.teardown(aModule);
}

// SETUP/TEARDOWN HELPERS

function openPage(page) {
  // Open up the test page and validate that it's the page we expect to be using
  browser.openURL(page.url);
  var element = new widgets.Element("id", page.id, browser.content.activeTab);
  if (!element.exists())
    throw new Error("Could not find element '" + page.id + "' in page '" + page.url + "'");
}

// TEST HELPERS

function clickBackAndVerify(page) {
  // Click on the back button and verify that we landed on the page we expect
  browser.ui.navBar.backButton.click();

  // This should be waitForPageLoad(), but it currently seems bugged when loading
  // via back/forward.
  driver.sleep(500);
  // browser.waitForPageLoad();

  var element = new widgets.Element("id", page.id, browser.content.activeTab);
  assert.ok(element.exists(), "Found '" + page.id + "'; correct page was landed on");
}

function clickForwardAndVerify(page) {
  // Click on the forward button and verify that we landed on the page we expect
  browser.ui.navBar.forwardButton.click();

  // This should be waitForPageLoad(), but it currently seems bugged when loading
  // via back/forward.
  driver.sleep(500);
  // browser.waitForPageLoad();

  var element = new widgets.Element("id", page.id, browser.content.activeTab);
  assert.ok(element.exists(), "Found '" + page.id + "'; correct page was landed on");
}

// NOTES ON CHANGES

// TEST_PAGES is an array because the test is order-based, so indexes are convenient.
// If the test was not order-based separate consts or a key/val dictionary would be
// much more readable in the code. Also note the short constant name; the current
// standard constant name of TEST_PAGES is needlessly long.

// IMO we shouldn't standardize on a single data structure type used to feed the
// test, and -definitely- not on an array. Arrays are the least readable structure
// in code due to the need to match up the index. The most appropriate structure
// for the test should be used, whether that's a const, obj, array, or whatever.

// All setup has been moved into the setup function, including the initial load
// of the pages for use in the test. This lets us review whether asserts and
// user actions are used appropriately in setup vs. test.

// In the test, loops have been unrolled and meat of loops moved into named helpers
// for clarity. I would only use forEach-type structures with a large array, or in
// non-test code. Helpers are named very literally.

// All test results are asserted (could have been expected), rather than implied
// by waitFor. Ultimately, explicitly posting results will be very important to our
// reporting.

// I also rearranged setup/test/teardown in chrono order. Minor, but helps read
// the flow. Makes more sense to do now that we're one test to a file.

// Generally speaking, I documented where you expect things to be as part of the
// flow (e.g. this will leave us on TEST_PAGES[3]). This helps with following the test.
