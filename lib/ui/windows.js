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
var driver = require('../api/driver');
var errors = require('../api/errors');
var inheritance = require("../api/inheritance");
var widgets = require('widgets');


// Constants
const MODAL_DIALOG_DELAY   =  100;
const MODAL_DIALOG_TIMEOUT = 5000;


/**
 * Observer object to find a modal dialog spawned by a given window
 *
 * @constructor
 * @class Observer used to find a modal dialog
 *
 * @param {WindowWrapper} aOpener Window which is the opener of the modal dialog
 * @param {Function} aCallback The callback handler to use to interact with the modal dialog
 */
function ModalDialogObserver(aOpener, aCallback) {
  this._opener = aOpener ? aOpener.innerWindow : null;
  this._callback = aCallback;
  this._timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
}


/**
 * Set our default values for our internal properties
 */
ModalDialogObserver.prototype._opener = null;
ModalDialogObserver.prototype._callback = null;
ModalDialogObserver.prototype._timer = null;
ModalDialogObserver.prototype.exception = null;
ModalDialogObserver.prototype.finished = null;


/**
 * Check the last opened window if it has been opened as a modal dailog. Further
 * also check that it different from the opener window. That allows us to handle
 * modal dialogs spawned from modal dialogs.
 *
 * @returns {DOMWindow} The window of the modal dialog, or null if not found.
 */
ModalDialogObserver.prototype.findWindow =
function ModalDialogObserver_findWindow() {
  let found = false;

  // If a window has been opened from content, it has to be unwrapped.
  let win = mozmill.utils.unwrapNode(driver.getLastOpenedWindow());

  // Get the WebBrowserChrome and check if it's a modal window
  let chrome = win.QueryInterface(Ci.nsIInterfaceRequestor).
               getInterface(Ci.nsIWebNavigation).
               QueryInterface(Ci.nsIDocShellTreeItem).
               treeOwner.
               QueryInterface(Ci.nsIInterfaceRequestor).
               getInterface(Ci.nsIWebBrowserChrome);
  if (!chrome.isWindowModal()) {
    return null;
  }

  // Opening a modal dialog from a modal dialog would fail, if we wouldn't
  // check for the opener of the modal dialog
  if (win.opener) {
    // XXX Bug 614757 - an already unwrapped node returns a wrapped node
    var opener = mozmill.utils.unwrapNode(win.opener);
    found = (mozmill.utils.getChromeWindow(opener) === this._opener);
  }
  else {
    // Also note that it could happen that dialogs don't have an opener
    // (i.e. clear recent history). In such a case make sure that the most
    // recent window is not the passed in reference opener
    found = (win !== this._opener);
  }

  return (found ? win : null);
}


/**
 * Called by the timer in the given interval to check if a modal dialog has
 * been opened. Once it has been found the callback gets executed. The function
 * also ensures that the dialog gets closed afterward.
 */
ModalDialogObserver.prototype.observe = function ModalDialogObserver_observe() {
  // Once the window has been found and finished loading we can execute the callback
  let win = this.findWindow();
  if (win && ("documentLoaded" in win)) {
    try {
      this._callback(new WindowWrapper(win));
    }
    catch (ex) {
      // Store the exception, so it can be forwarded if a modal dialog has
      // been opened by another modal dialog
      this.exception = ex;
    }

    if (win) {
      win.close();
    }

    this.finished = true;
    this.stop();
  }
  else {
    // otherwise try again in a bit
    this._timer.init(this, MODAL_DIALOG_DELAY, Ci.nsITimer.TYPE_ONE_SHOT);
  }
}


/**
 * Stop the timer which checks for new modal dialogs
 */
ModalDialogObserver.prototype.stop = function ModalDialogObserver_stop() {
  delete this._timer;
}



/**
 * Creates a new instance of a modal dialog.
 *
 * @constructor
 * @class Handler for modal dialogs
 *
 * @param {WindowWrapper} [aWindow=null]
 *        Window which is the opener of the modal dialog.
 */
function ModalDialog(aWindow) {
  this._window = aWindow || null;
}


/**
 * Checks if a modal dialog has been processed.
 *
 * @returns {boolean} True, if the dialog has been processed.
 */
ModalDialog.prototype.__defineGetter__("finished", function ModalDialog_finished() {
  return (!this._observer || this._observer.finished);
});


/**
 * Start timer to wait for a modal dialog.
 *
 * @param {function} aCallback
 *        The callback handler to interact with the modal dialog.
 */
ModalDialog.prototype.start = function ModalDialog_start(aCallback) {
  if (!aCallback)
    throw new errors.InvalidParameterError(arguments.callee.name +
                                           ": Callback not specified.");

  this._observer = new ModalDialogObserver(this._window, aCallback);
  this._timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
  this._timer.init(this._observer, MODAL_DIALOG_DELAY, Ci.nsITimer.TYPE_ONE_SHOT);
},


/**
 * Stop the timer which checks for a modal dialog.
 */
ModalDialog.prototype.stop = function ModalDialog_stop() {
  delete this._timer;

  if (this._observer) {
    let exception = this._observer.exception;

    this._observer.stop();
    delete this._observer;

    // Forward exception so it can be handled correctly by the caller
    if (exception) {
      throw exception;
    }
  }
}


/**
 * Wait until the modal dialog has been processed.
 *
 * @param {Number} [aTimeout=5s]
 *        Duration to wait for the modal dialog to appear.
 */
ModalDialog.prototype.waitForDialog = function ModalDialog_waitForDialog(aTimeout) {
  var timeout = aTimeout || MODAL_DIALOG_TIMEOUT;

  try {
    mozmill.utils.waitFor(function () {
      return this.finished;
    }, "Modal dialog has been processed.", timeout, undefined, this);
  }
  finally {
    this.stop();
  }
}



/**
 * Creates a new instance of a DOM window wrapper.
 *
 * @constructor
 * @class Wrapper for DOM windows
 *
 * @param {DOMWindow} [aDOMWindow=null]
 *        DOM window which has to be wrapped.
 */
function WindowWrapper(aDOMWindow) {
  // Make sure to wait until the window content has been loaded
  driver.waitFor(function () {
    return aDOMWindow && aDOMWindow.documentLoaded;
  }, "Window '" + aDOMWindow + "' has been loaded");

  this._window = aDOMWindow;

  // XXX: Remove once we do no longer rely on the controller
  this._controller = new mozmill.controller.MozMillController(this.innerWindow);

  // If the window gets unloaded, ensure that we execute all clean-up code.
  let self = this;
  this.innerWindow.addEventListener("unload", function(event) {
    self.destroy();
  }, false);

  // Inject an initial handler to catch an unexpected modal dialog
  this._modalDialog = new ModalDialog(this);
  this._setDefaultModalDialogHandler();
}


/**
 * Set our default values for our internal properties
 */
WindowWrapper.prototype._window = null;
WindowWrapper.prototype._modalDialog = null;


/**
 * Check if the wrapped DOMWindow has been closed.
 *
 * @returns {Boolean} True, if the window has been closed.
 */
WindowWrapper.prototype.__defineGetter__("closed", function WindowWrapper_getClosed() {
  return !this.innerWindow || this.innerWindow.closed;
});


/**
 * Retrieve the real DOMWindow instance.
 *
 * @returns {DOMWindow} The DOM window.
 */
WindowWrapper.prototype.__defineGetter__("innerWindow", function Window_WrappergetInnerWindow() {
  return this._window;
});


/**
 * Retrieve the window's title.
 *
 * @returns {String} Title of the window.
 */
WindowWrapper.prototype.__defineGetter__("title", function WindowWrapper_getTitle() {
  return this.innerWindow.document.title;
});


/**
 * Retrieve the window's type.
 *
 * @returns {String} Type of the window.
 */
WindowWrapper.prototype.__defineGetter__("type", function WindowWrapper_getType() {
  return this.innerWindow.document.documentElement.getAttribute("windowtype");
});


/**
 * Close the wrapped DOM window.
 */
WindowWrapper.prototype.close = function WindowWrapper_close() {
  if (!this.closed) {
    this.innerWindow.close();

    driver.waitFor(function () {
      return !this.opened;
    }, "Window has been closed.");
  }
}


/**
 * Clean-up all allocated instances of class members.
 */
WindowWrapper.prototype.destroy = function WindowWrapper_destroy() {
  this._modalDialog.stop();
  delete this._modalDialog;

  this._window = null;
}


/**
 * Handle another DOMWindow as specified by the filter.
 *
 * @param {Function} aFilterCallback
 *        Callback to filter the list of open windows.
 *        @see driver
 * @param {String} aFilterValue
 *        Value which gets checked in the filter callback.
 * @param {Function} [aCallback]
 *        Callback to execute for the target window. If no callback has been
 *        specified the instance of the window is returned and can be handled
 *        in the test itself.
 * @param {Boolean} [aClose=true]
 *        Flag to indicate if the window has to be closed. It's only taking into
 *        account if a callback has been specified. Otherwise the window stays
 *        open.
 *
 * @returns {WindowWrapper} The window if no callback has been specified.
 */
WindowWrapper.prototype.handleWindow =
function WindowWrapper_handleWindow(aFilterCallback, aFilterValue,
                                    aCallback, aClose) {
  let win = null;

  try {
    // Make sure the wanted window has been opened and is not the current one
    let self = this;
    driver.waitFor(function () {
      win = driver.getLastOpenedWindow(function (aWindow, aFilterValue) {
              return (aWindow !== self._window) && aFilterCallback(aWindow,
                                                                   aFilterValue);
            }, aFilterValue);

      return !!win;
    }, "Window has been found.");

    win = new WindowWrapper(win);

    if (aCallback) {
      aCallback(win);

      // Check if we have to close the window
      if (aClose === undefined || aClose)
        win.close();
    }
  }
  catch (e) {
    // In case of exceptions make sure that the window gets closed.
    if (win)
      win.close();

    throw e;
  }

  return win;
}


/**
 * Default handler for modal dialogs to catch unexpected dialogs.
 *
 * @param {WindowWrapper} aWindow Instance of the modal dialog.
 * @private
 */
WindowWrapper.prototype._defaultModalDialogHandler =
function WindowWrapper__defaultModalDialogHandler(aWindow) {
  let ident = (aWindow.title || aWindow.type || aWindow.id || 'unkown');
  let message = "A modal '" + ident + "' dialog has been opened unexpectedly."

  throw new errors.UnexpectedError(message);
}


/**
 * Set a default handler to catch unexpected modal dialogs. 
 */
WindowWrapper.prototype._setDefaultModalDialogHandler =
function WindowWrapper__setDefaultModalDialogHandler() {
  this.initModalDialog(this._defaultModalDialogHandler);
}


/**
 * Initialize the modal dialog handler.
 *
 * @param {function} aCallback
 *        The callback handler to interact with the modal dialog.
 */
WindowWrapper.prototype.initModalDialog =
function WindowWrapper_initModalDialog(aCallback) {
  // Stop any existing handler before setting up a new custom handler
  this._modalDialog.stop();
  this._modalDialog.start(aCallback);
}


/**
 * Wait for the modal dialog.
 *
 * @param {Number} [aTimeout=5s] Timeout for waiting for the modal dialog.
 */
WindowWrapper.prototype.waitForModalDialog =
function WindowWrapper_waitForModalDialog(aTimeout) {
  try {
    this._modalDialog.waitForDialog(aTimeout);
  }
  finally {
    // Revert to default handler
    this._setDefaultModalDialogHandler();
  }
}


/**
 * Mixin members of another class into the current instance. This function
 * does not work on the prototype of the source and destination class.
 *
 * @param {Object} aMixinClass Class which members have to be copied.
 */
WindowWrapper.prototype.mixin = function WindowWrapper_mixin(aMixinClass) {
  inheritance.mixin(this, aMixinClass);
}


// Export of classes
windows.WindowWrapper = WindowWrapper;
