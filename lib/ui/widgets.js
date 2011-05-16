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
 * @namespace Defines proxy classes for creation of a hierarchical map
 */
var widgets = exports;

var inheritance = require("../api/inheritance");
var dom = require("../api/dom");

// How long we're willing to implicitly wait for an HTML/XUL element to be available
// before giving up. Available, right now, means "exists." This should eventually be
// made configurable by an external file or similar.
const ELEM_WAIT_TIME = 5000;

/**
 * Element is a proxy for an element of a DOM. It defines the core binding
 * behavior: locating the element via any of serveral lookup methods.
 * It also provides the owner/owned relationship that allows Elements to be
 * arranged in a tree-shaped Element map.
 *
 * @class A proxy for an element of a DOM
 * @constructs
 *
 * @param {String} aLocatorType
 *   The type of locator being supplied. Choices are:
 *     <dl>
 *     <dd>node</dd>   <dt>A node, as in Mozmill's Elem()</dt>
 *     <dd>id</dd>     <dt>An ID string, as in Mozmill's ID()</dt>
 *     <dd>xpath</dd>  <dt>An XPath string, as in Mozmill's XPath()</dt>
 *     <dd>name</dd>   <dt>A name string, as in Mozmill's Name()</dt>
 *     <dd>lookup</dd> <dt>A lookup string, as in Mozmill's Lookup()</dt>
 *     <dd>tag</dd>    <dt>A JQuery-style element selector string</dt>
 *     </dl>
 * @param {node|String} aLocator
 *   The actual locator. If aLocatorType is "node," a node object is expected.
 *   For all other types, a String is expected.
 * @param {document|Element} aOwner
 *   The owner (parent) of this Element. The top of an Element map is owned by
 *   a document. Other members of the map are owned by their parent Elements.
 */
function Element(aLocatorType, aLocator, aOwner) {
  // When used as a prototype, will be called with no arguments.
  // Make sure to chain Element() from the child constructor for proper init.
  if (arguments.length === 0)
    return;

  // Locators are used to find the element. See _locateElem().
  this._validateLocatorType(aLocatorType);
  if (!aLocator) {
    throw new Error("Missing locator");
  }

  this._locator = aLocator;
  this._locatorType = aLocatorType;

  // aOwner can be either the document for the top level of the map,
  // or another Element that owns this one.
  if (aOwner) {
    if (aOwner instanceof Element) {
      // We must be an owned element. Get doc and controller from our owner.
      this._owner = aOwner;
      this._document = aOwner._document;
      this._chromeController = aOwner._chromeController;
    }
    else {
      // We must be a top-level element. We sent in a document as owner.
      this._owner = undefined;
      this._document = aOwner;

      // Depending on the document, this Element may or may not store a controller.
      // In Mozmill, content docs don't have a unique controller; controllers apply
      // to their containing window only. So if this is a content element, operations on
      // it will always route through the topmost browser window's controller.

      // If the document is Chrome...
      if (this._document.contentType.match("application/.*"))
        // ...it gets its own controller
        this._chromeController = new mozmill.controller.MozMillController(this._document.defaultView);
      else
        // ...otherwise, it's content. We (and any of our "owned" elements) will
        // always use the controller of the topmost browser window.
        this._chromeController = undefined;
    }
  }
  else {
    // Not supplied at all, so we're top level and our doc is the current window.
    this._owner = undefined;
    this._chromeController = mozmill.getBrowserController();
    this._document = this._controller.window.document;
  }

  // We'll lazy-get these when requested
  this._elem = undefined;
}

Element.prototype._getCollector = function Element__getCollector() {
  // Collectors take either a parent node or a parent document.
  // If we have an owner, supply its node. Otherwise, supply the
  // attached document (we're top level).
  if (this._owner)
    return new dom.nodeCollector(this._owner.node);
  else
    return new dom.nodeCollector(this._document);
}

Element.prototype.__defineGetter__("_controller", function Element__getController() {
  // For Chrome elements, the controller is cached. For content elements
  // no controller is cached. Instead, it's assumed the current browser
  // window controller is desired on any given call, since you're most
  // likely manipulating content in the same window
  //
  // For more details, see comments inline in the constructor.
  if (this._chromeController)
    return this._chromeController;
  else
    return mozmill.getBrowserController();
});


Element.prototype._validateLocatorType = function Element__validateLocatorType(aLocatorType) {
  switch (aLocatorType) {
    case "node":
    case "id":
    case "xpath":
    case "name":
    case "lookup":
    case "tag":
      // locatorType is valid, do nothing
      break;
    default:
      throw new Error("Invalid locator type: " + aLocatorType);
  }
}

Element.prototype._locateElem = function Element__locateElem() {
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
}

/**
 * The DOM document that is at the top of the map containing this Element.
 * @see <a href="https://developer.mozilla.org/en/DOM/document">MDC document reference</a>
 *
 * @name document
 * @type document
 * @fieldOf widgets.Element#
 */
Element.prototype.__defineGetter__("document", function Element_getDocument() {
  return this._document;
});

 /**
 * The DOM window object associated with this Element.
 * @see <a href="https://developer.mozilla.org/en/DOM/window">MDC window reference</a>
 *
 * @name window
 * @type window
 * @fieldOf widgets.Element#
 */
Element.prototype.__defineGetter__("window", function Element_getWindow() {
  return this._controller.window;
});

/**
 * The Mozmill elementslib object associated with this Element.
 * @see <a href="https://developer.mozilla.org/en/Mozmill/Mozmill_Elements_Library_Object">MDC elementslib reference</a>
 *
 * @name elem
 * @type elementslib
 * @fieldOf widgets.Element#
 */
Element.prototype.__defineGetter__("elem", function Element_getElem() {
  if (!this._elem)
    this._locateElem();

  return this._elem;
});

/**
 * Returns true if Element is pointing at a valid node, false otherwise
 *
 * @name isValid
 * @type boolean
 * @fieldOf widgets.Element#
 */
Element.prototype.__defineGetter__("exists", function Element_getExists() {
  return (this.node !== null);
});

/**
 * The DOM node object associated with this Element.
 * @see <a href="https://developer.mozilla.org/en/DOM/Node">MDC node reference</a>
 *
 * @name node
 * @type node
 * @fieldOf widgets.Element#
 */
Element.prototype.__defineGetter__("node", function Element_getNode() {
  return this.elem.getNode();
});

/**
 * Widget is an Element that corresponds to a visual control of an
 * HTML or Chrome document. More specific behavior for each is defined in
 * the child classes HtmlElement and XulElement.
 *
 * @class An Element that corresponds to an element of an HTML or Chrome document
 * @constructs
 * @extends widgets.Element
 *
 * @param {String} aLocatorType
 *   The type of locator being supplied. Choices are:
 *     <dl>
 *     <dd>node</dd>   <dt>A node, as in Mozmill's Elem()</dt>
 *     <dd>id</dd>     <dt>An ID string, as in Mozmill's ID()</dt>
 *     <dd>xpath</dd>  <dt>An XPath string, as in Mozmill's XPath()</dt>
 *     <dd>name</dd>   <dt>A name string, as in Mozmill's Name()</dt>
 *     <dd>lookup</dd> <dt>A lookup string, as in Mozmill's Lookup()</dt>
 *     <dd>tag</dd>    <dt>A JQuery-style element selector string</dt>
 *     </dl>
 * @param {node|String} aLocator
 *   The actual locator. If aLocatorType is "node," a node object is expected.
 *   For all other types, a String is expected.
 * @param {document|Element} aOwner
 *   The owner (parent) of this Element. The top of an Element map is owned by
 *   a document. Other members of the map are owned by their parent Elements.
*/
function Widget(aLocatorType, aLocator, aOwner) {
  Element.apply(this, arguments);
}
inheritance.extend(Widget, Element);

/**
 * Clicks on the Element with the left mouse button.
 *
 * @param {Number} [aLeft=center] Relative horizontal coordinate inside Element.
 * @param {Number} [aTop=center] Relative vertical coordinate inside Element.
 * @returns {Boolean} true if succeeded, false otherwise.
 */
Widget.prototype.click = function Widget_click(aLeft, aTop) {
  return this._controller.click(this.elem, aLeft, aTop);
}

/**
 * Double-clicks on the Element with the left mouse button.
 *
 * @param {Number} [aLeft=center] Relative horizontal coordinate inside Element.
 * @param {Number} [aTop=center] Relative vertical coordinate inside Element.
 * @returns {Boolean} true if succeeded, false otherwise.
 */
Widget.prototype.doubleClick = function Widget_doubleClick(aLeft, aTop) {
  return this._controller.click(this.elem, aLeft, aTop);
}

/**
 * Performs a key press for the given keycode.
 * Try to avoid the usage of the ctrlKey and metaKey modifiers if the
 * shortcut is a combination of Ctrl (Windows/Linux) and Cmd (Mac). In
 * this case, use accelKey instead which will work across operating systems.
 *
 * @param {String} aKeyCode Either a literal like 'b' or an enum like 'VK_ESCAPE'.
 * @param {Object} [aModifiers={}] Indicates modifier keys. true means pressed.
 * @param {Boolean} [aModifiers.ctrlKey=false] The Ctrl key.
 * @param {Boolean} [aModifiers.altKey=false] The Alt/Option key.
 * @param {Boolean} [aModifiers.shiftKey=false] The Shift key.
 * @param {Boolean} [aModifiers.metaKey=false] The Meta/Cmd key.
 * @param {Boolean} [aModifiers.accelKey=false] Ctrl key on Windows/Linux,
 *                                              Cmd key on Mac.
 * @return {Boolean} true if succeeded, false otherwise.
 */
Widget.prototype.keypress = function Widget_keypress(aKeyCode, aModifiers) {
  aModifiers = aModifiers || {};
  return this._controller.keypress(this.elem, aKeyCode, aModifiers);
}

/**
 * Presses the selected mouse button down on the Element.
 *
 * @param {Number} [aButton=0] The id of the button to press (0 - left, 1 - middle, 2 - right).
 * @param {Number} [aLeft=center] Relative horizontal coordinate inside Element.
 * @param {Number} [aTop=center] Relative vertical coordinate inside Element.
 * @returns {Boolean} true if succeeded, false otherwise.
 */
Widget.prototype.mouseDown = function Widget_mouseDown(aButton, aLeft, aTop) {
  return this._controller.mouseDown(this.elem, aButton, aLeft, aTop);
}

/**
 * Releases the selected mouse button on the Element.
 *
 * @param {Number} [aButton=0] The id of the button to press (0 - left, 1 - middle, 2 - right).
 * @param {Number} [aLeft=center] Relative horizontal coordinate inside Element.
 * @param {Number} [aTop=center] Relative vertical coordinate inside Element.
 * @returns {Boolean} true if succeeded, false otherwise.
 */
Widget.prototype.mouseUp = function Widget_mouseUp(aButton, aLeft, Top) {
  return this._controller.mouseUp(this.elem, aButton, aLeft, aTop);
}

/**
 * Clicks on the Element with the right mouse button.
 *
 * @param {Number} [aLeft=center] Relative horizontal coordinate inside Element.
 * @param {Number} [aTop=center] Relative vertical coordinate inside Element.
 * @returns {Boolean} true if succeeded, false otherwise.
 */
Widget.prototype.rightClick = function Widget_rightClick(aLeft, aTop) {
  return this._controller.rightClick(this.elem, aLeft, aTop);
}

/**
 * Synthesizes a mouse event on the given element
 *
 * @param {Number} [aOffsetX=center] Relative x offset in the element's bounds
 * @param {Number} [aOffsetY=center] Relative y offset in the element's bounds
 * @param {Object} [aEvent={}] Information about the event
 * @param {Boolean} [aEvent.ctrlKey=false] The Ctrl key.
 * @param {Boolean} [aEvent.altKey=false] The Alt/Option key.
 * @param {Boolean} [aEvent.shiftKey=false] The Shift key.
 * @param {Boolean} [aEvent.metaKey=false] The Meta/Cmd key.
 * @param {Boolean} [aEvent.accelKey=false] Ctrl key on Windows/Linux,
 *                                          Cmd key on Mac.
 * @param {Number} [aEvent.clickCount=1] Number of counts to click
 * @param {String} [aEvent.type="mousedown" + "mouseup"] Type of the mouse event
 *   <dl>
 *   <dd>click</dd>     <dt>Click of the mouse button</dt>
 *   <dd>mousedown</dd> <dt>Mouse button down</dt>
 *   <dd>mouseup</dd>   <dt>Mouse button up</dt>
 *   <dd>mouseover</dd> <dt>Mouse enters bounds</dt>
 *   <dd>mouseout</dd>  <dt>Mouse leaves bounds</dt>
 *   </dl>
 */
Widget.prototype.mouseEvent = function Widget_mouseEvent(aOffsetX, aOffsetY, aEvent) {
  aEvent = aEvent || {};
  return this._controller.mouseEvent(aOffsetX, aOffsetY, aEvent);
}

/**
 * Region is a Widget that corresponds to a grouping container in a Chrome
 * document.
 *
 * @class An Element that corresponds to a grouping container in a Chrome document.
 * @constructs
 * @extends widgets.Widget
 *
 * @param {String} aLocatorType
 *   The type of locator being supplied. Choices are:
 *     <dl>
 *     <dd>node</dd>   <dt>A node, as in Mozmill's Elem()</dt>
 *     <dd>id</dd>     <dt>An ID string, as in Mozmill's ID()</dt>
 *     <dd>xpath</dd>  <dt>An XPath string, as in Mozmill's XPath()</dt>
 *     <dd>name</dd>   <dt>A name string, as in Mozmill's Name()</dt>
 *     <dd>lookup</dd> <dt>A lookup string, as in Mozmill's Lookup()</dt>
 *     <dd>tag</dd>    <dt>A JQuery-style element selector string</dt>
 *     </dl>
 * @param {node|String} aLocator
 *   The actual locator. If aLocatorType is "node," a node object is expected.
 *   For all other types, a String is expected.
 * @param {document|Element} aOwner
 *   The owner (parent) of this Element. The top of an Element map is owned by
 *   a document. Other members of the map are owned by their parent Elements.
 */
function Region(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(Region, Widget);

function Button(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(Button, Widget);

function TextBox(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(TextBox, Widget);

TextBox.prototype.getText = function TextBox_getText() {
  return this.node.value;
}

TextBox.prototype.type = function TextBox_type(aText) {
  this._controller.type(this.elem, aText);
}

function Button_Menu(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(Button_Menu, Widget);

function Button_MenuButton(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(Button_MenuButton, Widget);

function TextBox_Multi(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(TextBox_Multi, Widget);

function TextBox_Number(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(TextBox_Number, Widget);

function TextBox_Password(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(TextBox_Password, Widget);

function TextBox_Auto(aLocatorType, aLocator, aOwner) {
  Widget.apply(this, arguments);
}
inheritance.extend(TextBox_Auto, Widget);

// Exported Classes
widgets.Element = Element;
widgets.Widget = Widget;
widgets.Region = Region;
widgets.Button = Button;
widgets.TextBox = TextBox;
widgets.Button_Menu = Button_Menu;
widgets.Button_MenuButton = Button_MenuButton;
widgets.TextBox_Multi = TextBox_Multi;
widgets.TextBox_Number = TextBox_Number;
widgets.TextBox_Password = TextBox_Password;
widgets.TextBox_Auto = TextBox_Auto;
