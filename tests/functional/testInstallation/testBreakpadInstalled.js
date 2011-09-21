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
 * The Initial Developer of the Original Code is Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2009
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

// Include required modules
var head = require("../../../lib/head");
var services = require("../../../lib/services");


// File names for crash reporter application on all platforms
const FILENAMES = { "darwin" : "crashreporter.app",
                    "win32"  : "crashreporter.exe",
                    "linux"  : "crashreporter"
};

const STATES = { enabled: true,
                 regex: /^https:\/\/crash-reports\.mozilla\.com\/submit.*/
};


function setupModule(aModule) {
  head.setup(aModule);

  // Get the executable file of the crash reporter from the application directory
  aModule.file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
  aModule.file.initWithPath(services.dirsvc.get("XCurProcD", Ci.nsILocalFile).path);
  aModule.file.append(FILENAMES[mozmill.platform]);
}


/**
 * Test that the crash reporter is installed
 */
function testBreakpadInstalled() {
  // Check that the crash reporter executable is present
  expect.ok(file.exists(), "Crash reporter application is available");

  // Check that the crash reporter is enabled and has the correct server URL set
  expect.equal(services.crashReporter.enabled, STATES.enabled,
               "Crash reporter has the expected enabled state");
  expect.match(services.crashReporter.serverURL.spec, STATES.regex,
               "Server URL contains the correct address");
}


function teardownModule(aModule) {
  head.teardown(aModule);
}
