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

/**
 * @name init
 * @namespace Helper methods for the general setup and teardown logic of tests
 *            and methods
 */

/**
 * @name module
 * @namespace Augmented features into the Mozmill module scope
 */


/**
 * Basic initialization we want for every test module
 *
 * @memberOf init
 * @param {object} aModule
 *        Test module to initialize
 */
function testModule(aModule) {
  /**
   * Instance of the Assert class to execute tests with fatal assertions
   *
   * @name assert
   * @type assertions.Assert
   * @memberOf module
   */
  aModule.assert = require("assertions").assert;

  /**
   * Instance of the Expect class to execute tests with non-fatal assertions
   *
   * @name expect
   * @type assertions.Expect
   * @memberOf module
   */
  aModule.expect = require("assertions").expect;

  /**
   * Object with wrapper methods for back-end services
   *
   * @name services
   * @type services
   * @memberOf module
   */
  aModule.services = require("services");


  aModule.Browser = require("ui/browser");
  // Initialize the test module
  // XXX: Holding off on adding this until we're sure how we get the browser
  // module.browser = require("ui/browser").get();
}


/**
 * Basic initialization we want for every UI module
 * Currently can't be used because setupModule isn't called for shared mods
 *
 * @memberOf init
 * @param {object} aModule
 *        UI module to initialize
 */
function uiModule(aModule) {
  // Add generally used requires
  aModule.Inheritance = require("external/inheritance");
  aModule.Widgets = require("ui/widgets");
}


// Export of methods
exports.testModule = testModule;
exports.uiModule = uiModule;
