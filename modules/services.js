const PREFERENCES = "@mozilla.org/preferences-service;1";
const SESSION_STORE = "@mozilla.org/browser/sessionstore;1";

var prefService =
exports.prefService = Cc[PREFERENCES].getService(Ci.nsIPrefService);

var sessionStore =
exports.sessionStore = Cc[SESSION_STORE].getService(Ci.nsISessionStore);
