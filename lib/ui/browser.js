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
 *   Henrik Skupin <hskupin@mozilla.com>
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
 * @namespace Defines the browser object that provides access to the Firefox UI
 */
var browser = exports;

var inheritance = require("../api/inheritance");
var navBar = require("navbar");
var tabBar = require("tabbar");
var widgets = require("widgets");

/**
 * Browser is a UI map of Firefox, along with basic utility methods.
 *
 * @class A UI map of Firefox, along with basic utility methods
 *
 * @param {Document} aDocument
 *   The document associated with the browser window being automated
 */
function Browser(aDocument) {
  widgets.Region.call(this, "tag", "#main-window", aDocument);

  this.tabBar = new tabBar.TabBar("tag", "#TabsToolbar", this);
  this.navBar = new navBar.NavBar("tag", "#nav-bar", this);
}
inheritance.extend(Browser, widgets.Region);

Browser.prototype.openURL = function Browser_openURL(aURL, aTimeout) {
  this._controller.open(aURL);
  if (aTimeout === undefined || aTimeout > 0)
    this.waitForPageLoad(aTimeout);
}

/**
 * Waits for the page in the current tab to finish loading.
 *
 * @param {Number} [aTimeout=5000]
 *  Timeout for the page load.
 */
Browser.prototype.waitForPageLoad = function Browser_waitForPageLoad(aTimeout) {
  this._controller.waitForPageLoad(aTimeout);
}

/**
 * Corresponds to the Mozmill tabs object
 *
 * @name content
 * @type Object
 * @fieldOf browser.Browser#
 * @see https://developer.mozilla.org/en/Mozmill/Mozmill_Controller_Object
 */
Browser.prototype.__defineGetter__("content", function Browser_getTabs() {
  return this._controller.tabs;
});

browser.Browser = Browser;
