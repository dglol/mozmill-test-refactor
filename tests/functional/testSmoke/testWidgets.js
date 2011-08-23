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

var head = require("../../../lib/head");
var navBar = require("../../../lib/ui/browser/navbar");
var widgets = require("../../../lib/ui/widgets");

function setupModule(aModule) {
  head.setup(aModule);
}

function teardownModule(aModule) {
  head.teardown(aModule);
}

function testGetElement() {
  // get a single element, access its node, and dump it to console.
  // Also click it to check controller
  var myElement = new widgets.Widget("tag", "#urlbar");
  dump("ID: " + myElement.node.id + "\n");
  myElement.click();
}

function testGetElementChain() {
  // get two elements, one under the other, dump to the console.
  // Also click second element to check controller
  var myOwner = new widgets.Widget("tag", "#nav-bar");
  dump("ID: " + myOwner.node.id + "\n");
  var myOwned = new widgets.Widget("tag", "#urlbar", myOwner);
  dump("ID: " + myOwned.node.id + "\n");
  myOwned.click();
}

function testGetElementWithDoc() {
  // get a single element, click it to make sure controller works
  var doc = mozmill.getBrowserController().window.document;
  var myElement = new widgets.Widget("tag", "#urlbar", doc);
  dump("ID: " + myElement.node.id + "\n");
  myElement.click();
}

function testNavBar() {
  // get the nav bar
  var myNavBar = new navBar.NavBar("tag", "#nav-bar");
  dump("navBar ID: " + myNavBar.node.id + "\n");
  dump("navBar.homeButton ID: " + myNavBar.homeButton.node.id + "\n");
  dump("navBar.urlBarText ID: " + myNavBar.urlBarText.node.id + "\n");
  myNavBar.homeButton.click();
}
