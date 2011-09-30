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
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Anthony Hughes <ashughes@mozilla.com>
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
var widgets = require("../../../lib/ui/widgets");

function setupModule(aModule) {
  head.setup(aModule);
}

/**
 * Test the Get Me Out Of Here button from an Untrusted Error page
 */
function testUntrustedPageGetMeOutOfHereButton() {
  // Go to an untrusted website
  browser.openURL("https://mozilla.org");
  
  // Get a reference to the Get Me Out Of Here button
  // TODO We should add this to a UI map for the security warning page
  var getMeOutOfHereButton = new widgets.Button("id", "getMeOutOfHereButton", browser.content.activeTab);
  assert.ok(getMeOutOfHereButton.exists());
  
  // Click the button and wait for the page to load
  getMeOutOfHereButton.click();
  browser.waitForPageLoad();
  
  // Verify the loaded page is the homepage
  assert.equal(browser.ui.navBar.urlBarText.getText(), prefs.getHomepage(prefs.defaultBranch));
}

function teardownModule(aModule) {
  head.teardown(aModule);
}
