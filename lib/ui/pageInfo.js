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

var pageInfo = exports;

// Include necessary modules
var dtds = require("../dtds");
var driver = require('../api/driver');
var inheritance = require("../api/inheritance");
var l10n = require("../l10n");
var widgets = require("widgets");
var windows = require("../api/windows");


/**
 * Creates a new instance of a Page Info window wrapper
 *
 * @constructor
 * @class Wrapper for a Page Info window
 *
 * @param {DOMWindow} aDOMWindow
 *        DOM window which has to be wrapped.
 */
function PageInfoWindow(aDOMWindow) {
  windows.ChromeWindowWrapper.apply(this, arguments);

  this.ui = new PageInfoUI(this.innerWindow.document);
}
inheritance.extend(PageInfoWindow, windows.ChromeWindowWrapper);


/**
 * Map of ui elements accessible in a page info window
 *
 * @param {Object} aDocument Document of the chrome window
 */
function PageInfoUI(aDocument) {
  widgets.Region.call(this, "tag", "#main-window", aDocument);

  // Get the instance of the main menu
  this.mainMenu = this._controller.getMenu("menubar");

  this.panelSelector = new widgets.RadioGroup("tag", "#viewGroup", this);
  this.deck = new widgets.Region("tag", "#mainDeck", this);
}
inheritance.extend(PageInfoUI, widgets.Region);


// Export of classes
pageInfo.PageInfoWindow = PageInfoWindow;
