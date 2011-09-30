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
 *   Anthony Hughes <ahughes@mozilla.com>
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
var pageInfo = require("../../../lib/ui/pageInfo");


// To have all buttons active we need a web page with a RSS feed
const BASE_URL = collector.addHttpResource('../../../data/');
const TEST_PAGE = BASE_URL + 'rss/newsfeed.html';

// Available categories and associated panels
var CATEGORIES = [
  {button: 'generalTab', panel: 'generalPanel'},
  {button: 'mediaTab', panel: 'mediaPanel'},
  {button: 'feedTab', panel: 'feedPanel'},
  {button: 'permTab', panel: 'permPanel'},
  {button: 'securityTab', panel: 'securityPanel'}
];


function setupModule(aModule) {
  head.setup(aModule);
}


/**
 * Test the functionality of the main categories in the page info window
 */
function testPageInfoCategories() {
  browser.openURL(TEST_PAGE);

  // Open the page info window
  browser.ui.mainMenu.click("#menu_pageInfo");
  browser.handleWindow(driver.windowFilterByType("Browser:page-info"),
                       checkPageInfoWindow);
}


function checkPageInfoWindow(aWindow) {
  var win = new pageInfo.PageInfoWindow(aWindow);
  var keys = win.ui.topBar.categories.keys;

  assert.equal(keys.length, CATEGORIES.length, "Correct count of categories");

  // Walk through each single category
  for (var i = 0; i < keys.length; i++) {
    var button = win.ui.topBar.categories.buttons[keys[i]];

    expect.equal(button.node.id, CATEGORIES[i].button,
                 "Radio button for category exists");

    button.click();

    // TODO: Needs implementation of a xul:deck class
    expect.equal(win.ui.deck.node.selectedPanel.id, CATEGORIES[i].panel,
                 "The target panel has been selected");
  }
}


function teardownModule(aModule) {
  head.teardown(aModule);
}
