var Inheritance = require("../external/inheritance");
var Navbar = require("navbar");
var Tabbar = require("tabbar");

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
    this._window = aWindow || wm.getMostRecentWindow("navigator:browser");
    this._document = this._window.document;

    this.parent(this._document, "#main-window");
  },

  get navbar() {
    this._navbar = this._navbar || new Navbar.NavBar(this.node);
    return this._navbar;
  },

  get tabbar() {
    this._tabbar = this._tabbar || new Tabbar.TabBar(this.node);
    return this._tabbar;
  },

  get window() {
    return this._window;
  },

  // temporarily - should be part of the tabs module.
  openURL : function Browser_openURL(aURL, aTimeout) {
    this.navbar.locationbar.type(aURL);
    this.navbar.locationbar.keypress("VK_RETURN", {});
    this.controller.waitForPageLoad(aTimeout);
  },

  waitForPageLoad : function Browser_waitForPageLoad(aTimeout) {
    this.controller.waitForPageLoad(aTimeout);
  }
});
