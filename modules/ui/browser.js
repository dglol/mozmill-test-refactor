var inheritance = require("../external/inheritance");
var navbar = require("navbar");

// Needed if we have special widgets
var widgets = exports.widgets = require("widgets");

var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
         .getService(Ci.nsIWindowMediator);

var init = exports.init = function init(aWindow) {
  return new Browser(aWindow);
}

var Browser = exports.Browser = inheritance.Class.extend(widgets.Element, {
  initialize : function(aWindow) {
    this.window = aWindow || wm.getMostRecentWindow("navigator:browser");
    this.document = this.window.document;

    this.parent(this.document, "#main-window");
  },

  navbar : function() {
    this._navbar = this._navbar || new navbar.NavBar(this.document);
    return this._navbar;
  },

  // temporarily - should be part of the tabs module.
  waitForPageLoad : function(aTimeout) {
    this.controller.waitForPageLoad(aTimeout);
  }
});
