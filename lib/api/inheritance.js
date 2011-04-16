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
 * @namespace Helper functions to allow prototypal inheritance and mixins
 */
var inheritance = exports;


/**
 * Extends a class's prototype with properties and methods from another class. 
 *
 * @private
 * @param {Object} aTargetClass Class to extend.
 * @param {Object} aBaseClass Class to derive from.
 */
function extend(aTargetClass, aBaseClass) {
  aTargetClass.prototype = new aBaseClass();

  aTargetClass.prototype.constructor = aTargetClass;
  aTargetClass.prototype.parent = aBaseClass.prototype;
}


/**
 * Mixin properties and methods into an instance of a class.
 *
 * @param {Object} aInstance Instance of a class to put the data onto.
 * @param {Object} aMixinClass Class definition to get the data from.
 */
function mixin(aInstance, aMixinClass) {
  for (var prop in aMixinClass) {
    // Getters and Setters have to be handled differently.
    // Note: Right now we do not check if the target class already has the same
    // property or method assigned. It will be replaced in any case.
    if (aMixinClass.__lookupGetter__(prop)) {
      aInstance.__defineGetter__(prop, aMixinClass.__lookupGetter__(prop));
    } else if (aMixinClass.__lookupSetter__(prop)) {
      aInstance.__defineSetter__(prop, aMixinClass.__lookupSetter__(prop));
    } else {
      aInstance[prop] = aMixinClass[prop];
    }
  }
}


// Export of functions
inheritance.extend = extend;
inheritance.mixin = mixin;
