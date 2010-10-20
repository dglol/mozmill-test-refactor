var inheritance = require("../../modules/external/inheritance");
var widgets = require("widgets");

var NavBar = exports.NavBar = inheritance.Class.extend(widgets.Element, {
  initialize : function(parentNode) {
    this.parent(parentNode, "#nav-bar");
  },

  get home() {
    this._home = this._home || new widgets.Button(this.document, "#home-button");
    return this._home;
  },

  get locationbar() {
    this._locationbar = this._locationbar || new LocationBar(this.document);
    return this._locationbar;
  }
});


var LocationBar = exports.LocationBar = inheritance.Class.extend(widgets.Textbox, {
  initialize : function(parentNode) {
    this.parent(parentNode, "#urlbar");
  }
});


