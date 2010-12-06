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
 *   Geo Mealer <gmealer@mozilla.com>
 *   Henrik Skupin <hskupin@mozilla.com>
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

var Inheritance = require("../external/inheritance");
var DomUtils = require("../dom_utils");

var Element = Inheritance.Class.extend({
 // XXX: stub
});

var XmlElement = Inheritance.Class.extend(Element, {
 // XXX: stub
});

var HtmlXulElement = Inheritance.Class.extend(Element, {
 // XXX: stub
});

var HtmlElement = Inheritance.Class.extend(HtmlXulElement, {
  // XXX: stub
});

var XulElement = Inheritance.Class.extend(HtmlXulElement, {
  // XXX: stub
});

var Button = Inheritance.Class.extend(XulElement, {
  // XXX: stub
});

var TextBox = Inheritance.Class.extend(XulElement, {
  // XXX: stub
});

var Button_Menu = Inheritance.Class.Extend(Button, {
  // XXX: stub
});

var Button_MenuButton = Inheritance.Class.Extend(Button, {
  // XXX: stub
});

var TextBox_Multi = Inheritance.Class.extend(TextBox, {
  // XXX: stub
});

var TextBox_Number = Inheritance.Class.extend(TextBox, {
  // XXX: stub
});

var TextBox_Password = Inheritance.Class.extend(TextBox, {
  // XXX: stub
});

var TextBox_Auto = Inheritance.Class.extend(TextBox, {
  // XXX: stub
});

// Exported Classes
exports.Element = Element;
exports.XmlElement = XmlElement;
exports.HtmlXulElement = HtmlXulElement;
exports.HtmlElement = HtmlElement;
exports.XulElement = XulElement;
exports.Button = Button;
exports.TextBox = TextBox;
exports.Button_Menu = Button_Menu;
exports.Button_MenuButton = Button_MenuButton;
exports.TextBox_Multi = TextBox_Multi;
exports.TextBox_Number = TextBox_Number;
exports.TextBox_Password = TextBox_Password;
exports.TextBox_Auto = TextBox_Auto;