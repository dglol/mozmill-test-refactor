const PREFERENCES = "@mozilla.org/preferences-service;1";
const SESSION_STORE = "@mozilla.org/browser/sessionstore;1";

var prefService = Cc[PREFERENCES].getService(Ci.nsIPrefService);
var sessionStore = Cc[SESSION_STORE].getService(Ci.nsISessionStore);

exports.prefService = prefService;
exports.sessionStore = sessionStore;
