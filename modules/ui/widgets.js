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

/**
 * @name widgets
 * @namespace Defines proxy classes for creation of a hierarchical map
 */

var Inheritance = require("../external/inheritance");
var DomUtils = require("../dom_utils");
var Services = require("../services");

// How long we're willing to implicitly wait for an HTML/XUL element to be available
// before giving up. Available, right now, means "exists." This should eventually be
// made configurable by an external file or similar.
const ELEM_WAIT_TIME = 5000;

var Element = Inheritance.Class.create(
/** @lends widgets.Element */
{
  /**
   * Element is a proxy for an element of a DOM. It defines the core binding
   * behavior: locating the element via any of serveral lookup methods.
   * It also provides the owner/owned relationship that allows Elements to be
   * arranged in a hierarchy.
   *
   * @class A proxy for an element of a DOM
   * @constructs
   * @memberOf widgets
   */
  initialize: function Element_initialize(locatorType, locator, owner) {
    // Locators are used to find the element. See _locateElem().
    this._validateLocatorType(locatorType);
    if (!locator) {
      throw new Error("Missing locator");
    }

    this._locator = locator;
    this._locatorType = locatorType;

    // Owner can be either the document for the top level of the map,
    // or another Element that owns this one.
    if (owner) {
      if (owner instanceof Element) {
        // We must be an owned element. Get doc and controller from our owner.
        this._owner = owner;
        this._document = owner._document;
        this._controller = owner._controller;
      }
      else {
        // We must be a top-level element. We sent in a document as owner.
        this._owner = undefined;
        this._document = owner;
        this._controller = mozmill.controller.MozMillController(this._document.defaultView);
      }
    }
    else {
      // Not supplied at all, so we're top level and our doc is the current window.
      this._owner = undefined;
      this._controller = mozmill.getBrowserController();
      this._document = this._controller.window.document;
    }

    // We'll lazy-get these when requested
    this._elem = undefined;
  },

  _getCollector: function Element_getCollector() {
    // Collectors take either a parent node or a parent document.
    // If we have an owner, supply its node. Otherwise, supply the
    // attached document (we're top level).
    if (this._owner)
      return new DomUtils.nodeCollector(this._owner.node);
    else
      return new DomUtils.nodeCollector(this._document);
  },

  _validateLocatorType: function element_validateLocatorType(locatorType) {
    switch (locatorType) {
      case "node":
      case "id":
      case "xpath":
      case "name":
      case "lookup":
      case "tag":
        // locatorType is valid, do nothing
        break;
      default:
        throw new Error("Invalid locator type: " + locatorType);
    }
  },

  _locateElem: function Element_locateElem() {
    switch (this._locatorType) {
      // First the standard Elem constructors.
      case "node":
        this._elem = new elementslib.Elem(this._locator);
        break;
      case "id":
        this._elem = new elementslib.ID(this._document, this._locator);
        break;
      case "xpath":
        this._elem = new elementslib.XPath(this._document, this._locator);
        break;
      case "name":
        this._elem = new elementslib.Name(this._document, this._locator);
        break;
      case "lookup":
        this._elem = new elementslib.Lookup(this._document, this._locator);
        break;

      // Finally, the nodeCollector.
      // XXX: I'm calling this tag instead of selector, because I have
      // intentions of introducing a path chain of selectors like
      // "#foo/#bar/#baz" that mean "node with selector '#baz' under node
      // with selector '#bar' under node with selector #foo, all under the
      // owner of this Element". That will give us huge, huge flexibility in
      // specifying node queries. However, we still have to account for
      // property and anonymous locators, so there's significant work to
      // be done here. Ultimately, I'm not 100% sure what a final tag will
      // look like.
      case "tag":
        var collector = this._getCollector();
        collector.queryNodes(this._locator);
        if (collector.nodes.length < 1)
          throw new Error("Could not find node for tag: " + this._locator);
        if (collector.nodes.length > 1)
          throw new Error("Found more than one node for tag: " + this._locator);
        this._elem = new elementslib.Elem(collector.nodes[0]);
        break;
      default:
        throw new Error("Unknown locator type: " + this._locatorType);
    }
  },

  // XXX: note that properties don't properly inherit yet. Need work in
  // inheritance.js. In the meantime, if need to override, have to split
  // out the guts of the property into a private _function so that the
  // parent() function will work correctly, then call private _function
  // from the property.
  get document() {
    return this._document;
  },

  get controller() {
    return this._controller;
  },

  get window() {
    return this._controller.window;
  },

  get elem() {
    if (!this._elem)
      this._locateElem();

    return this._elem;
  },

  get node() {
    return this.elem.getNode();
  }
});

var XmlElement = Inheritance.Class.extend(Element,
/** @lends widgets.XmlElement */
{
  /**
   * XmlElement is an Element that corresponds to a single element in
   * an XML document.
   *
   * @class An Element that corresponds to a single element in an XML document
   * @constructs
   * @memberOf widgets
   * @extends widgets.Element
   */
   initialize: function XmlElement_initialize(locatorType, locator, owner) {
     this.parent(locatorType, locator, owner);
   }
});

var XmlTree = Inheritance.Class.extend(Element,
/** @lends widgets.XmlTree */
{
  /**
   * XmlTree is an Element that corresponds to a subtree of an XML document.
   *
   * @class An Element that corresponds to a subtree in an XML document.
   * @constructs
   * @memberOf widgets
   * @extends widgets.Element
   */
   initialize: function XmlTree_initialize(locatorType, locator, owner) {
     this.parent(locatorType, locator, owner);
   }
});

var HtmlXulElement = Inheritance.Class.extend(Element,
/** @lends widgets.HtmlXulElement */
{
  /**
   * HtmlXulElement is an Element that corresponds to an element of a
   * HTML or Chrome document. More specific behavior for each is defined in
   * the child classes HtmlElement and XulElement.
   *
   * @class An Element that corresponds to an element of an HTML or Chrome document
   * @constructs
   * @memberOf widgets
   * @extends widgets.Element
   */
  initialize: function HtmlXulElement_initialize(locatorType, locator, owner) {
    this.parent(locatorType, locator, owner);
  },

  click: function HtmlXulElement_click(left, top) {
    this.controller.click(this.elem, left, top);
  },

  doubleClick: function HtmlXulElement_doubleClick(left, top) {
    this.controller.click(this.elem, left, top);
  },

  keyPress: function HtmlXulElement_keypress(keycode, modifiers) {
    modifiers = modifiers || {};
    this.controller.keypress(this.elem, keycode, modifiers);
  },

  mouseDown: function HtmlXulElement_mouseDown(button, left, top) {
    this.controller.mouseDown(this.elem, button, left, top);
  },

  mouseUp: function HtmlXulElement_mouseUp(button, left, top) {
    this.controller.mouseUp(this.elem, button, left, top);
  },

  rightClick: function HtmlXulElement_rightClick(left, top) {
    this.controller.rightClick(this.elem, left, top);
  }
});

var HtmlElement = Inheritance.Class.extend(HtmlXulElement,
/** @lends widgets.HtmlElement */
{
  /**
   * HtmlElement is an Element that corresponds to an element of an HTML document.
   *
   * @class An Element that corresponds to an element of an HTML document.
   * @constructs
   * @memberOf widgets
   * @extends widgets.HtmlXulElement
   */
  initialize: function HtmlElement_initialize(locatorType, locator, owner) {
    this.parent(locatorType, locator, owner);
  },
});

var HtmlRegion = Inheritance.Class.extend(HtmlElement,
/** @lends widgets.HtmlRegion */
{
  /**
   * HtmlRegion is an Element that corresponds to a grouping container in an HTML
   * document.
   *
   * @class An Element that corresponds to a grouping container in an HTML document.
   * @constructs
   * @memberOf widgets
   * @extends widgets.HtmlElement
   */
  initialize: function HtmlRegion_initialize(locatorType, locator, owner) {
    this.parent(locatorType, locator, owner);
  },
});

var XulElement = Inheritance.Class.extend(HtmlXulElement,
/** @lends widgets.XulElement */
{
  /**
   * XulElement is an Element that corresponds to an element of a Chrome
   * document.
   *
   * @class An Element that corresponds to an element of a Chrome document.
   * @constructs
   * @memberOf widgets
   * @extends widgets.HtmlXulElement
   */
  initialize: function XulElement_initialize(locatorType, locator, owner) {
    this.parent(locatorType, locator, owner);
  },
});

var XulRegion = Inheritance.Class.extend(XulElement,
/** @lends widgets.XulRegion */
{
  /**
   * XulRegion is an Element that corresponds to a grouping container in a Chrome
   * document.
   *
   * @class An Element that corresponds to a grouping container in a Chrome document.
   * @constructs
   * @memberOf widgets
   * @extends widgets.XulElement
   */
  initialize: function XulRegion_initialize(locatorType, locator, owner) {
    this.parent(locatorType, locator, owner);
  },
});

var Button = Inheritance.Class.extend(XulElement, {
  // XXX: stub
});

var TextBox = Inheritance.Class.extend(XulElement, {
  getText: function TextBox_getText() {
    return this.node.value;
  },

  type: function TextBox_type(text) {
    this.controller.type(this.elem, text);
  }
});

var Button_Menu = Inheritance.Class.extend(Button, {
  // XXX: stub
});

var Button_MenuButton = Inheritance.Class.extend(Button, {
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
exports.HtmlRegion = HtmlRegion;
exports.XulElement = XulElement;
exports.XulRegion = XulRegion;
exports.Button = Button;
exports.TextBox = TextBox;
exports.Button_Menu = Button_Menu;
exports.Button_MenuButton = Button_MenuButton;
exports.TextBox_Multi = TextBox_Multi;
exports.TextBox_Number = TextBox_Number;
exports.TextBox_Password = TextBox_Password;
exports.TextBox_Auto = TextBox_Auto;