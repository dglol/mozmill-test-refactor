var Browser = require("../../modules/ui/browser");
var Services = require("../../modules/services");

function setupModule(module) {
  browser = Browser.get();

  assert = require("../../modules/assert");
}

function testElements() {
  browser.navbar.home.click();
  browser.openURL("https://addons.mozilla.org");

  browser.navbar.locationbar.type("http://www.google.de");
  browser.navbar.locationbar.keypress("VK_RETURN", {});
  browser.waitForPageLoad();

  var count = Services.sessionStore.getClosedWindowCount(browser.window);
  assert.is(count, 0, "There should be no window in the undo stack");
}
