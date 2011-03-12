var widgets = require("../modules/ui/widgets");
var navBar = require("../modules/ui/navbar");

function testGetElement() {
  // get a single element, access its node, and dump it to console.
  var myElement = new widgets.Element("tag", "#urlbar");
  dump("ID: " + myElement.node.id + "\n");
}

function testGetElementChain() {
  // get two elements, one under the other, dump to the console.
  var myOwner = new widgets.Element("tag", "#nav-bar");
  dump("ID: " + myOwner.node.id + "\n");
  var myOwned = new widgets.Element("tag", "#urlbar", myOwner);
  dump("ID: " + myOwned.node.id + "\n");  
}

function testNavBar() {
  // get the nav bar
  var myNavBar = new navBar.NavBar();
  dump("navBar ID: " + myNavBar.node.id + "\n");
  dump("navBar.homeButton ID: " + myNavBar.homeButton.node.id + "\n");
  dump("navBar.urlBarText ID: " + myNavBar.urlBarText.node.id + "\n");
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