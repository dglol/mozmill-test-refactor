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
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Henrik Skupin <hskupin@mozilla.com> (Original Author)
 *  Geo Mealer <gmealer@mozilla.com>
 *  Owen Coutts <ocoutts@mozilla.com>
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

var services = require('../services');
var driver = require('driver');

/**
 * @namespace Bookmark- and history-related functions
 */
var places = exports;

/**
 * Removes all history for the current profile
 */
function removeAllHistory() {
  const TOPIC_EXPIRATION_FINISHED = "places-expiration-finished";

  // Set up an observer so we get notified when remove completes
  var expirationSuccessful = false;
  let expirationObserver = {
    observe: function(aSubject, aTopic, aData) {
      if (aTopic === TOPIC_EXPIRATION_FINISHED)
        expirationSuccessful = true;
    }
  }

  services.obs.addObserver(expirationObserver, TOPIC_EXPIRATION_FINISHED, false);
  try {
    // Fire off the remove
    services.browserHistory.removeAllPages();

    // Wait for it to be finished--observer above flips the flag.
    driver.waitFor(function () {
      return expirationSuccessful;
    }, "History has been removed");
  }
  finally {
    // Whatever happens, remove the observer.
    services.obs.removeObserver(expirationObserver, TOPIC_EXPIRATION_FINISHED);
  }
}

/**
 * Restore the default bookmarks for the current profile
 */
function restoreDefaultBookmarks() {
  const TOPIC_BOOKMARKS_RESTORE_SUCCESS = "bookmarks-restore-success";
  const BOOKMARKS_RESOURCE = "resource:///defaults/profile/bookmarks.html";

  // In theory, could take a long time to finish. In practice never seems to.
  const BOOKMARKS_TIMEOUT = 10000;

  // Set up the observer -- we're only checking for success here, so we'll simply
  // time out and throw on failure. It makes the code much clearer than handling
  // finished state and success state separately.
  var importSuccessful = false;
  var importObserver = {
    observe: function (aSubject, aTopic, aData) {
      if (aTopic === TOPIC_BOOKMARKS_RESTORE_SUCCESS)
        importSuccessful = true;
    }
  }

  services.obs.addObserver(importObserver, TOPIC_BOOKMARKS_RESTORE_SUCCESS, false);
  try {
    // newURI requires all params to be supplied, even if undefined.
    var bookmarksURI = services.io.newURI(BOOKMARKS_RESOURCE, undefined, undefined);

    // Fire off the import
    services.importexport.importHTMLFromURI(bookmarksURI, true);

    // Wait for it to be finished--the observer above will flip this flag
    driver.waitFor(function () {
      return importSuccessful;
    }, "Default bookmarks have finished importing", BOOKMARKS_TIMEOUT);
  }
  finally {
    // Whatever happens, remove the observer afterwards
    services.obs.removeObserver(importObserver, TOPIC_BOOKMARKS_RESTORE_SUCCESS);
  }
}

// EXPORTS

places.removeAllHistory = removeAllHistory;
places.restoreDefaultBookmarks = restoreDefaultBookmarks;
