var Inheritance = require("../external/inheritance");
var Widgets = require("widgets");

var TabBar = exports.TabBar = Inheritance.Class.extend(Widgets.Element, {
  initialize : function TabBar_initialize(parentNode) {
    this.parent(parentNode, "#TabsToolbar");
  },

  get tabs() {
    return new Tabs(this.node);
  }
});

var Tabs = exports.Tabs = Inheritance.Class.extend(Widgets.Element, {
  initialize : function Tabs_initialize(parentNode) {
    this.parent(parentNode, "#tabbrowser-tabs");
  },

  // TODO: Needs to go to mix-in class
  get rows() {
    var DOMUtils = require("dom_utils");
    var collector = new DOMUtils.nodeCollector(this.node);
    collector.queryNodes(".tabbrowser-tab");
    return collector.nodes;
  },

  get length() {
    return this.nodes.length;
  },

  at : function Tabs_at(index) {
    return this.rows[index];
  }
});
