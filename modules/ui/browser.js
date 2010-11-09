var Inheritance = require("../external/inheritance");
var Navbar = require("navbar");

// Needed if we have special widgets
var Widgets = exports.Widgets = require("widgets");

var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
         .getService(Ci.nsIWindowMediator);

/**
 * Get an instance of the browser window
 */
var get = exports.get = function get(aWindow) {
  return new Browser(aWindow);
}

/**
 * UI class to handle the browser window
 */
var Browser = exports.Browser = Inheritance.Class.extend(Widgets.Element, {
  initialize : function Browser_initialize(aWindow) {
    this.window = aWindow || wm.getMostRecentWindow("navigator:browser");
    this.document = this.window.document;

    this.parent(this.document, "#main-window");
  },

  get navbar() {
    this._navbar = this._navbar || new Navbar.NavBar(this.document);
    return this._navbar;
  },

  // temporarily - should be part of the tabs module.
  loadURL : function Browser_loadURL(aURL) {
    this.navbar.locationbar.type(aURL);
    this.navbar.locationbar.keypress("VK_RETURN", {});
    this.controller.waitForPageLoad(aTimeout);
  },

  waitForPageLoad : function Browser_waitForPageLoad(aTimeout) {
    this.controller.waitForPageLoad(aTimeout);
  }
});
