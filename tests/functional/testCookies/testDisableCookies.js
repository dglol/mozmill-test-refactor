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
 *   Dave Hunt <dhunt@mozilla.com>
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

var head = require("../../../lib/head");
var prefs = require("../../../lib/prefs");
var services = require("../../../lib/services");

const LOCAL_TEST_FOLDER = collector.addHttpResource('../../../data/');
const LOCAL_TEST_PAGE = LOCAL_TEST_FOLDER + 'cookies/cookie_single.html';

const PREF_COOKIE_BEHAVIOUR = "network.cookie.cookieBehavior";

function setupModule(aModule) {
  head.setup(aModule);
  services.cookies.removeAll();
}

/**
 * Tests disabling cookies
 */
function testDisableCookies() {
  // Disable accepting cookies from sites
  prefs.setPref('integer', PREF_COOKIE_BEHAVIOUR, 2);

  // Go to a test page to build a cookie
  browser.openURL(LOCAL_TEST_PAGE);

  // Check no cookies have been stored for hostname
  hostname = browser.content.activeTab.defaultView.location.hostname;
  assert.equal(services.cookies.countCookiesFromHost("localhost"), 0);
}

function teardownModule(aModule) {
  head.teardown(aModule);
  prefs.clearUserPref(PREF_COOKIE_BEHAVIOUR);
  services.cookies.removeAll();
}

/**
 * Map test functions to litmus tests
 */
// testDisableCookies.meta = {litmusids : [8053]};
