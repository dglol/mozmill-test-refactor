var widgets = require("../../lib/ui/widgets");
var navBar = require("../../lib/mixins/browser/navbar");

function testGetElement() {
  // get a single element, access its node, and dump it to console.
  // Also click it to check controller
  var myElement = new widgets.Widget("tag", "#urlbar");
  dump("ID: " + myElement.node.id + "\n");
  myElement.click();
}

function testGetElementChain() {
  // get two elements, one under the other, dump to the console.
  // Also click second element to check controller
  var myOwner = new widgets.Widget("tag", "#nav-bar");
  dump("ID: " + myOwner.node.id + "\n");
  var myOwned = new widgets.Widget("tag", "#urlbar", myOwner);
  dump("ID: " + myOwned.node.id + "\n");  
  myOwned.click();
}

function testGetElementWithDoc() {
  // get a single element, click it to make sure controller works
  var doc = mozmill.getBrowserController().window.document;
  var myElement = new widgets.Widget("tag", "#urlbar", doc);
  dump("ID: " + myElement.node.id + "\n");
  myElement.click();
}

function testNavBar() {
  // get the nav bar
  var myNavBar = new navBar.NavBar("tag", "#nav-bar");
  dump("navBar ID: " + myNavBar.node.id + "\n");
  dump("navBar.homeButton ID: " + myNavBar.homeButton.node.id + "\n");
  dump("navBar.urlBarText ID: " + myNavBar.urlBarText.node.id + "\n");
  myNavBar.homeButton.click();
}

// 
// function testTheDream() {
//   var browser;
//   
//   browser = new Browser("tag", "#main-window", {
//     navBar: new Regions.NavBar("tag", "#nav-bar", {
//       homeButton: new Widgets.Button("tag", "#homebutton"),
//       urlBar:     new Widgets.TextBox("tag", "#urlbar")
//     })
//   });
// }
