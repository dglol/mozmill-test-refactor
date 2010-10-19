var mod_browser = require("../../modules/ui/browser");

function setupModule() {
  browser = mod_browser.init();
}

function testElements() {
  browser.navbar().homeButton().click();
  browser.navbar().locationbar().open("https://addons.mozilla.org");
  browser.waitForPageLoad();

  browser.navbar().locationbar().type("http://www.google.de");
  browser.navbar().locationbar().keypress("VK_RETURN", {});
  browser.waitForPageLoad();
}
