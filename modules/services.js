/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <mail@hskupin.info> (Original Author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


/**
 * @name services
 * @namespace Defines wrapper methods for back-end services
 */
var services = exports;


// Import global Javascript modules offered by Firefox
Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");


/**#@+
   @memberOf services
*/

/**
 * Service for application related properties
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/xpcom/system/nsIXULAppInfo.idl">nsIXULAppInfo</a>
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/xpcom/system/nsIXULRuntime.idl">nsIXULRuntime</a>
 */
services.appinfo = Services.appinfo;


/**
 * Service for handling bookmarks
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/places/public/nsINavBookmarksService.idl">nsINavBookmarksService</a>
 */
XPCOMUtils.defineLazyGetter(services, "bookmarks", function () {
  return Cc["@mozilla.org/browser/nav-bookmarks-service;1"].
         getService(Ci.nsINavBookmarksService);
});


/**
 * Service for handling the browser's global history
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/places/public/nsIBrowserHistory.idl">nsIBrowserHistory</a>
 */
XPCOMUtils.defineLazyGetter(services, "browserHistory", function () {
  return Cc["@mozilla.org/browser/nav-history-service;1"].
         getService(Ci.nsIBrowserHistory);
});


/**
 * Service to access the clipboard
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/widget/public/nsIClipboardHelper.idl">nsIClipboardHelper</a>
 */
XPCOMUtils.defineLazyGetter(services, "clipboard", function () {
  return Cc["@mozilla.org/widget/clipboardhelper;1"].
         getService(Ci.nsIClipboardHelper);
});


/**
 * Service to access the Error Console
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/xpcom/base/nsIConsoleService.idl">nsIConsoleService</a>
 */
services.console = Services.console;


/**
 * Service for handling content related preferences
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/dom/interfaces/base/nsIContentPrefService.idl">nsIContentPrefService</a>
 */
services.contentPrefs = Services.contentPrefs;


/**
 * Service for handling cookies
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/netwerk/cookie/nsICookieManager2.idl">nsICookieManager2</a>
 */
XPCOMUtils.defineLazyGetter(services, "cookies", function () {
  return Cc["@mozilla.org/cookiemanager;1"].
         getService(Ci.nsICookieManager2);
});


/**
 * Service for handling files and directories
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsIDirectoryService.idl">nsIDirectoryService</a>
 */
services.dirsvc = Services.dirsvc;


/**
 * Service for handling downloads
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/downloads/public/nsIDownloadManager.idl">nsIDownloadManager</a>
 */
XPCOMUtils.defineLazyGetter(services, "downloads", function () {
  return Cc["@mozilla.org/download-manager;1"].
         getService(Ci.nsIDownloadManager);
});


/**
 * Service for handling data of certificates
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/netwerk/dns/nsIEffectiveTLDService.idl">nsIEffectiveTLDService</a>
 */
services.eTLD = Services.eTLD;


/**
 * Service for handling the history of form elements
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/satchel/public/nsIFormHistory.idl">nsIFormHistory2</a>
 */
XPCOMUtils.defineLazyGetter(services, "forms", function () {
  return Cc["@mozilla.org/satchel/form-history;1"].
         getService(Ci.nsIFormHistory2);
});


/**
 * Service to handle network related I/O operations
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/netwerk/base/public/nsIIOService.idl">nsIIOService</a>
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/netwerk/base/public/nsIIOService2.idl">nsIIOService2</a>
 */
services.io = Services.io;


/**
 * Service to handle the Places history
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/places/public/nsINavHistoryService.idl">nsINavHistoryService</a>
 */
XPCOMUtils.defineLazyGetter(services, "history", function () {
  return Cc["@mozilla.org/browser/nav-history-service;1"].
         getService(Ci.nsINavHistoryService);
});


/**
 * Service to handle locale related information
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/intl/locale/idl/nsILocaleService.idl">nsILocaleService</a>
 */
services.locale = Services.locale;


/**
 * Service to handle the password manager
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/passwordmgr/public/nsILoginManager.idl">nsILoginManager</a>
 */
XPCOMUtils.defineLazyGetter(services, "logins", function () {
  return Cc["@mozilla.org/login-manager;1"].
         getService(Ci.nsILoginManager);
});


/**
 * Service to handle the observer service
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/xpcom/ds/nsIObserverService.idl">nsIObserverService</a>
 */
services.obs = Services.obs;


/**
 * Service to handle Private Browsing
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/netwerk/base/public/nsIPrivateBrowsingService.idl">nsIPrivateBrowsingService</a>
 */
XPCOMUtils.defineLazyGetter(services, "pbs", function () {
  return Cc["@mozilla.org/privatebrowsing;1"].
         getService(Ci.nsIPrivateBrowsingService);
});


/**
 * Service to access the permission manager on a site-by-site basis
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/netwerk/base/public/nsIPermissionManager.idl">nsIPermissionManager</a>
 */
services.perms = Services.perms;


/**
 * Service to access preferences
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/modules/libpref/public/nsIPrefService.idl">nsIPrefService</a>
 */
// XXX: We can't use the native prefs service yet because it QI to nsIPrefBranch2
// and our preferences module doesn't support it
// services.prefs = Services.prefs;
XPCOMUtils.defineLazyGetter(services, "prefs", function () {
  return Cc["@mozilla.org/preferences-service;1"].
         getService(Ci.nsIPrefService);
});


/**
 * Service to handle prompts
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/embedding/components/windowwatcher/public/nsIPromptService.idl">nsIPromptService</a>
 */
services.prompt = Services.prompt;


/**
 * Service to handle the browser's search feature
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/netwerk/base/public/nsIBrowserSearchService.idl">nsIBrowserSearchService</a>
 */
services.search = Services.search;


/**
 * Service to handle sessions
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/browser/components/sessionstore/nsISessionStore.idl">nsISessionStore</a>
 */
XPCOMUtils.defineLazyGetter(services, "session", function () {
  return Cc["@mozilla.org/browser/sessionstore;1"].
         getService(Ci.nsISessionStore);
});


/**
 * Service to access the storage service
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/storage/public/mozIStorageService.idl">mozIStorageService</a>
 */
services.storage = Services.storage;


/**
 * Service to handle strings
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/intl/strres/public/nsIStringBundle.idl">nsIStringBundleService</a>
 */
services.strings = Services.strings;


/**
 * Service to handle formatting of URLs based on application properties
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/urlformatter/public/nsIURLFormatter.idl">nsIURLFormatter</a>
 */
services.urlFormatter = Services.urlFormatter;


/**
 * Service to compare application versions
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/xpcom/base/nsIVersionComparator.idl">nsIVersionComparator</a>
 */
services.vc = Services.vc;


/**
 * Service to handle windows
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/xpfe/appshell/public/nsIWindowMediator.idl">nsIWindowMediator</a>
 */
services.wm = Services.wm;


/**
 * Service to operate on windows
 *
 * @see <a href="http://mxr.mozilla.org/mozilla-central/source/embedding/components/windowwatcher/public/nsIWindowWatcher.idl">nsIWindowWatcher</a>
 */
services.ww = Services.ww;
