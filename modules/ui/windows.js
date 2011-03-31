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
 *   Henrik Skupin <mail@hskupin.info>
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
 * @namespace Helper methods for the handling of all kinds of windows
 */
var windows = exports;

// Include necessary modules
var driver = require('../driver');
var inheritance = require("../external/inheritance");
var widgets = require('widgets');



function Window(aDOMWindow) {
  // Make sure to wait until the window content has been loaded
  driver.waitFor(function () {
    return aDOMWindow && aDOMWindow.documentLoaded;
  }, "Window '" + aDOMWindow + "' has been loaded");
  this._window = aDOMWindow;
}

Window.prototype = {
  /**
   *
   */
  _window: null,

  /**
   *
   */
  get innerWindow() {
    return this._window;
  },

  /**
   *
   */
  get closed() {
    return !this._window || this._window.closed;
  },

  /**
   *
   */
  get title() {
    return this._window.document.title;
  },

  /**
   *
   */
  get type() {
    return this._window.document.documentElement.getAttribute("windowtype");
  },

  /**
   *
   */
  close: function Window_close() {
    if (!this.closed) {
      this._window.close();

      driver.waitFor(function () {
        return !this.opened;
      }, "Window has been closed.");

      this._window = null;
    }
  },

  /**
   *
   */
  handleWindow: function Window_handleWindow(aFilterCallback, aValue, aCallback,
                                             aClose) {
    let win = null;

    try {
      // Make sure the wanted window has been opened and is not the current one
      let self = this;
      driver.waitFor(function () {
        win = driver.getLastOpenedWindow(function (aWindow, aValue) {
          return (aWindow !== self._window) && aFilterCallback(aWindow, aValue);
        }, aValue);

        return !!win;
      }, "Window has been found.");

      win = new Window(win);
    
      if (aCallback) {
        aCallback(win);

        // Check if we have to close the window
        if (aClose === undefined || aClose)
          win.close();
      }
    }
    catch (e) {
      if (win)
        win.close();

      throw e;
    }

    return win;
  }
};



// Export of classes
windows.Window = Window;
