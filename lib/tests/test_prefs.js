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

var head = require("../head");
var prefs = require("../prefs");


const TEST_DATA = [
  { type: "boolean", pref: "security.enable_tls", value: false, defaultValue: true },
  { type: "integer", pref: "network.proxy.type", value: 42, defaultValue: -1 },
  { type: "string", pref: "browser.startup.homepage", value: "http://www.mozilla.org", defaultValue: "empty" }
];


function setupModule(module) {
  head.setup(module);
}


function teardownModule(module) {
  head.teardown(module);
}


/**
 * Test all preferences related helper methods
 */
function testPreferences() {
  for each (let test in TEST_DATA) {
    let message = "preference '" + test.pref + "' of type '" + test.type + "' ";

    let curValue = prefs.getPref(test.type, test.pref);
    let defValue = prefs.getPref(test.type, test.pref, undefined, prefs.defaultBranch);

    expect.notEqual(curValue, undefined, "unmodified " + message + "has a value set");
    expect.notEqual(curValue, undefined, "unmodified " + message + "has a default value set");
    expect.equal(curValue, defValue, "unmodified " + message + "has the same value and default value");

    // Modify current value of preference
    prefs.setPref(test.type, test.pref, test.value);
    curValue = prefs.getPref(test.type, test.pref);
    defValue = prefs.getPref(test.type, test.pref, undefined, prefs.defaultBranch);

    expect.notEqual(curValue, undefined, "modified " + message + "has a value set");
    expect.notEqual(curValue, undefined, "modified " + message + "has a default value set");
    expect.notEqual(curValue, defValue, "modified " + message + "has not the same value and default value");

    // Reset user set preference
    prefs.clearUserPref(test.pref);
    curValue = prefs.getPref(test.type, test.pref);
    defValue = prefs.getPref(test.type, test.pref, undefined, prefs.defaultBranch);

    expect.notEqual(curValue, undefined, "cleared " + message + "has a value set");
    expect.notEqual(curValue, undefined, "cleared " + message + "has a default value set");
    expect.equal(curValue, defValue, "cleared " + message + "has the same value and default value");

    // Test unkown preference
    let unknownName = test.pref + ".unknown";

    curValue = prefs.getPref(test.type, unknownName, test.defaultValue);
    defValue = prefs.getPref(test.type, unknownName, test.defaultValue, prefs.defaultBranch);

    expect.equal(curValue, test.defaultValue, "default value returned for unknown " + message);
    expect.equal(curValue, test.defaultValue, "default value returned for unknown default " + message);
    expect.equal(curValue, defValue, "Identical default value for unknown " + message);
  }

  // Test a complex preference on the default branch
  let test = TEST_DATA[2];

  let defaultValue = prefs.getPref(test.type, test.pref, undefined, prefs.defaultBranch);
  let localizedURL = prefs.getPref(Ci.nsIPrefLocalizedString, test.pref, undefined, prefs.defaultBranch);

  expect.notEqual(defaultValue, localizedURL, "The localized string is different from the value");
}
