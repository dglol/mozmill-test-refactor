var Widgets = require("../modules/ui/widgets");
var NavBar = require("../modules/ui/navbar");

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

function testNavBar() {
  // get the nav bar
  var navBar = new NavBar.NavBar();
  dump("navBar ID: " + navBar.node.id + "\n");
  dump("navBar.homeButton ID: " + navBar.homeButton.node.id + "\n");
  dump("navBar.urlBarText ID: " + navBar.urlBarText.node.id + "\n");
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