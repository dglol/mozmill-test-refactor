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
 * @namespace Defines helper methods to access the preferences system.
 */
var prefs = exports;


// Include necessary modules
var services = require("services");


// Translation of the data type to the preferences function
const TYPE_TO_FUN = {
  "boolean": "BoolPref",
  "integer": "IntPref",
  "string" : "CharPref"
};


/**
 * Clear an user set value from a preference.
 *
 * @memberOf prefs
 * @param {String} aPrefName The preference to be cleared.
 * @param {PrefBranch} [aBranch] Preferences branch to use.
 *
 * @returns {Boolean} True, if the preference has been cleared.
 **/
function clearUserPref(aPrefName, aBranch) {
  let branch = aBranch || services.prefs;

  try {
    branch.clearUserPref(aPrefName);
    return true;
  }
  catch (e) {
    return false;
  }
}


/**
 * Retrieve the value of the specified preference
 *
 * @memberOf prefs
 * @param {String|Interface} aType
 *        Data type of the preference. For complex preferences use the interface.
 *        For atomic data types the following specifiers are allowed:
 *        <dl>
 *          <dt>boolean</dt><dd>A boolean preference</dd>
 *          <dt>integer</dt><dd>An integer preference</dd>
 *          <dt>string</dt><dd>A string preference</dd>
 *        </dl>
 * @param {String} aPrefName
 *        Name of the preference.
 * @param {Boolean|Number|String|Object} [aDefaultValue]
 *        Default value which will be used if the preference doesn't exist.
 * @param {PrefBranch} [aBranch]
 *        Preferences branch to use.
 *
 * @returns {Boolean|Number|String|Object} The value of the preference
 */
function getPref(aType, aPrefName, aDefaultValue, aBranch) {
  let branch = aBranch || services.prefs;

  try {
    if (typeof aType === 'string') {
      let method = "get" + TYPE_TO_FUN[aType];
      return branch[method](aPrefName);
    }
    else {
      return branch.getComplexValue(aPrefName, aType).data;
    }
  }
  catch (e) {
    return aDefaultValue;
  }
}


/**
 * Set the value of the specified preference
 *
 * @memberOf prefs
 * @param {String|Interface} aType
 *        Data type of the preference. For complex preferences use the interface.
 *        For atomic data types the following specifiers are allowed:
 *        <dl>
 *          <dt>boolean</dt><dd>A boolean preference</dd>
 *          <dt>integer</dt><dd>An integer preference</dd>
 *          <dt>string</dt><dd>A string preference</dd>
 *        </dl>
 * @param {String} aPrefName
 *        Name of the preference.
 * @param {Boolean|Number|String|Object} [aValue]
 *        New value to be set.
 * @param {PrefBranch} [aBranch]
 *        Preferences branch to use.
 */
function setPref(aType, aPrefName, aValue, aBranch) {
  let branch = aBranch || services.prefs;

  try {
    if (typeof aType === 'string') {
      let method = "set" + TYPE_TO_FUN[aType];
      branch[method](aPrefName, aValue);
    }
    else {
      branch.setComplexValue(aPrefName, aType, aValue);
    }
  }
  catch (e) {
  }
}


/**
 * The default branch of the preferences system
 *
 * @memberOf prefs
 *
 * @returns {PrefBranch} The default preference branch
 */
prefs.defaultBranch = services.prefs.getDefaultBranch("");


// Export of functions
prefs.clearUserPref = clearUserPref;
prefs.getPref = getPref;
prefs.setPref = setPref;
