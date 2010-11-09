var Inheritance = require("../../modules/external/inheritance");
var Widgets = require("widgets");

var NavBar = exports.NavBar = Inheritance.Class.extend(Widgets.Element, {
  initialize : function NavBar_initialize(parentNode) {
    this.parent(parentNode, "#nav-bar");
  },

  get home() {
    this._home = this._home || new Widgets.Button(this.document, "#home-button");
    return this._home;
  },

  get locationbar() {
    this._locationbar = this._locationbar || new LocationBar(this.document);
    return this._locationbar;
  }
});


var LocationBar = exports.LocationBar = Inheritance.Class.extend(Widgets.Textbox, {
  initialize : function LocationBar_initialize(parentNode) {
    this.parent(parentNode, "#urlbar");
  }
});


