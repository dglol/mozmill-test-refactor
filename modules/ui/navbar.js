var inheritance = require("../../modules/external/inheritance");
var widgets = require("widgets");

var NavBar = exports.NavBar = inheritance.Class.extend(widgets.Element, {
  initialize : function(parentNode) {
    this.parent(parentNode, "#nav-bar");
  },

  homeButton : function() {
    this._homeButton = this._homeButton || new widgets.Button(this.document, "#home-button");
    return this._homeButton;
  },

  locationbar : function() {
    this._locationbar = this._locationbar || new LocationBar(this.document);
    return this._locationbar;
  }
});


var LocationBar = exports.LocationBar = inheritance.Class.extend(widgets.Textbox, {
  initialize : function(parentNode) {
    this.parent(parentNode, "#urlbar");
  },

  open : function(aURL) {
    this.type(aURL);
    this.keypress("VK_RETURN", {});
  }
});


