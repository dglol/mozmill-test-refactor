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

var browser = exports;


// Include necessary modules
var navBar = require("../ui/navbar");
var tabBar = require("../ui/tabbar");


/**
 *
 */
var BrowserMixin = {
  get ui() {
    return new BrowserMap(this.innerWindow.document);
  },

  // Original said this was part of tabs, but disagree. This will have to be
  // part of browser, because browser will be the class that has A) a link to
  // the navBar and B) a link to the tabs in order to check that the page
  // actually appeared after waitForPageLoad ends.
  openURL: function Browser_openURL(aURL, aTimeout) {
    this._controller.open(aURL);
    this.waitForPageLoad(aTimeout);

    // XXX: should check after itself to see if page is actually loaded and
    // throw an error if not.

    return this;
  },

  /**
   *
   */
  waitForPageLoad: function Browser_waitForPageLoad(aTimeout) {
    // Support for background tabs has to be included
    this._controller.waitForPageLoad(aTimeout);

    return this;
  }
}


function BrowserMap(aDocument) {
  this._document = aDocument;

  this._navBar = new navBar.NavBar("tag", "#nav-bar", this._document);
  this._tabBar = new tabBar.TabBar("tag", "#TabsToolbar", this._document);
}

BrowserMap.prototype = {
  get navBar() {
    return this._navBar;
  },

  get tabBar() {
    return this._tabBar;
  }
}

browser.BrowserMixin = BrowserMixin;
