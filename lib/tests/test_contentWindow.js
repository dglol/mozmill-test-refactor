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
var errors = require("../api/errors");
var {expect} = require("../api/assertions");
var inheritance = require("../api/inheritance");
var widgets = require("../ui/widgets");
var windows = require("../api/windows");


const LOCAL_TEST_FOLDER = collector.addHttpResource('../../data/');
const LOCAL_TEST_PAGE = LOCAL_TEST_FOLDER + 'layout/mozilla.html';


function MozillaSiteWindow(aWindow) {
  windows.WindowWrapper.apply(this, arguments);
  this.ui = new MozillaSiteUI(this.innerWindow.document);
}
inheritance.extend(MozillaSiteWindow, windows.ContentWindowWrapper);


function MozillaSiteUI(aDocument) {
  widgets.Region.call(this, "tag", "body", aDocument);

  this.community = new widgets.Element("tag", "#community", this);
}
inheritance.extend(MozillaSiteUI, widgets.Region);


function setupModule(aModule) {
  head.setup(aModule);
}


/**
 * Test the content window support
 */
function testContentWindows() {
  browser.openURL(LOCAL_TEST_PAGE);

  // Check for an element via a basic content window wrapper
  var win = browser.getContentWindow(browser.content.activeTab.defaultView);
  var elem = new widgets.Element("tag", "#community", win.innerWindow.document);
  expect.equal(elem.node.tagName, "P", "Element is a paragraph");

  // Check an element via an ui map of a custom content window wrapper
  var win = browser.getContentWindow(browser.content.activeTab.defaultView,
                                     MozillaSiteWindow);
  expect.equal(win.ui.community.node.tagName, "P", "Element is a paragraph");
}


function teardownModule(aModule) {
  head.teardown(aModule);
}
