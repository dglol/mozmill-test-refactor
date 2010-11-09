var Browser = require("../../modules/ui/browser");

function setupModule(module) {
  browser = Browser.get();
}

function testElements() {
  browser.navbar.home.click();
  browser.openURL("https://addons.mozilla.org");

  browser.navbar.locationbar.type("http://www.google.de");
  browser.navbar.locationbar.keypress("VK_RETURN", {});
  browser.waitForPageLoad();
}
