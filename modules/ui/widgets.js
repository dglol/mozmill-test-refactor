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

var inheritance = require("../external/inheritance");
var dom_utils = require("dom_utils");

var Element = exports.Element = inheritance.Class.extend({

  /**
   * 
   */
  initialize : function(parentNode, selector) {
    this.parentNode = parentNode;
    this.selector = selector;
    this.document = this.parentNode.ownerDocument || this.parentNode;
    this.window = this.document.defaultView;

    this.collector = new dom_utils.nodeCollector(this.parentNode);
    this.controller = new mozmill.controller.MozMillController(this.window);
  },

  get element() {
    return new elementslib.Elem(this.node);
  },

  get node() {
    this.collector.queryNodes(this.selector);
    return this.collector.nodes[0];
  },

  click : function() {
    this.controller.click(this.element);
  }
});

var Control = exports.Control = inheritance.Class.extend(Element, {
  initialize : function(parentNode, selector) {
    this.parent(parentNode, selector);
  },

  keypress : function(aKey, aModifiers) {
    this.controller.keypress(this.element, aKey, aModifiers);
  }
});

var Button = exports.Button = inheritance.Class.extend(Control, {
  initialize : function(parentNode, selector) {
    this.parent(parentNode, selector);
  }
});

var Textbox = exports.Textbox = inheritance.Class.extend(Control, {
  initialize : function(parentNode, selector) {
    this.parent(parentNode, selector);
  },

  type : function(aText) {
    this.controller.type(this.element, aText);
  }
});
