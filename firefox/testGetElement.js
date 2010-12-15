var Widgets = require("../modules/ui/widgets");

function testGetElement() {
  // get a single element, access its node, and dump it to console.
  var myElement = new Widgets.Element("tag", "#urlbar");
  dump("ID: " + myElement.node.id + "\n");
}

function testGetElementChain() {
  // get two elements, one under the other, dump to the console.
  var myOwner = new Widgets.Element("tag", "#nav-bar");
  dump("ID: " + myOwner.node.id + "\n");
  var myOwned = new Widgets.Element("tag", "#urlbar", myOwner);
  dump("ID: " + myOwned.node.id + "\n");  
}