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
 *   Geo Mealer <gmealer@mozilla.com>
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
var driver = require('driver');
var errors = require('errors');
var inheritance = require("inheritance");
var widgets = require('../ui/widgets');


// Constants
const MODAL_DIALOG_DELAY   =  100;
const MODAL_DIALOG_TIMEOUT = 5000;


/**
 * Observer object to find a modal dialog spawned by a given window
 *
 * @constructor
 * @class Observer used to find a modal dialog
 *
 * @param {ChromeWindowWrapper} aOpener Window which is the opener of the modal dialog
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
  let win = driver.getNewestWindow();

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
    found = (mozmill.utils.getChromeWindow(win.opener) === this._opener);
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
  if (isWindowLoaded(win)) {
    try {
      this._callback(win);
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
 * @param {ChromeWindowWrapper} [aWindow=null]
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
 *
 */
function WindowWrapper(aWindow) {
  // If aWindow is undefined, this is a prototype and we should exit now.
  if (!aWindow)
    return;

  this._window = aWindow;

  // XXX: Remove once we do no longer rely on the controller
  this._controller = new mozmill.controller.MozMillController(aWindow);

  // If the window gets unloaded, ensure that we execute all clean-up code.
  // Needs to be a named function to be able to remove it, easiest way is to
  // just designate the destructor method as the handler.
  this.addEventListener("unload", this.destroy, false);
}


/**
 * Set our default values for our internal properties
 */
WindowWrapper.prototype._window = null;


/**
 * Check if the wrapped window has been closed.
 *
 * @returns {Boolean} True, if the window has been closed.
 */
WindowWrapper.prototype.__defineGetter__("closed", function WindowWrapper_getClosed() {
  return !this.innerWindow || this.innerWindow.closed;
});


/**
 * Retrieve the real window instance.
 *
 * @returns {Window} The window.
 */
WindowWrapper.prototype.__defineGetter__("innerWindow", function WindowWrapper_getInnerWindow() {
  return this._window;
});


/**
 * Check if the window content has been finished loading
 *
 * @returns {Boolean} True if the window has been loaded
 */
WindowWrapper.prototype.__defineGetter__("isLoaded", function WindowWrapper_isLoaded() {
  return isWindowLoaded(this.innerWindow);
});


/**
 * Close the wrapped window.
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
  // Constructor set up an event listener to call this method, so remove it.
  this.removeEventListener("unload", this.destroy, false);

  this._window = null;
}


/**
 * Find an element in the specified owner document
 *
 * @param {String} aLocatorType
 *   The type of locator being supplied. Choices are:
 *     <dl>
 *     <dd>node</dd>   <dt>A node, as in Mozmill's Elem()</dt>
 *     <dd>id</dd>     <dt>An ID string, as in Mozmill's ID()</dt>
 *     <dd>xpath</dd>  <dt>An XPath string, as in Mozmill's XPath()</dt>
 *     <dd>name</dd>   <dt>A name string, as in Mozmill's Name()</dt>
 *     <dd>link</dd>   <dt>A link string, as in Mozmill's Link()</dt>
 *     <dd>lookup</dd> <dt>A lookup string, as in Mozmill's Lookup()</dt>
 *     <dd>tag</dd>    <dt>A CSS-style element selector string</dt>
 *     <dd>anon</dd>   <dt>An object with a single key/val pair of the attribute.
 *     </dl>
 * @param {node|String|Object} aLocator
 *   The actual locator. If aLocatorType is "node," a node object is expected.
 *   If aLocatorType is "anon", an object with a single key/val pair is expected.
 *   For all other types, a String is expected.
 * @param {String} [aType="Widget"]
 *   Element class from widgets to instanciate from
 * @param {document|Element} [aOwner=this.innerWindow.document]
 *   The owner (parent) of this Element. The top of an Element map is owned by
 *   a document. Other members of the map are owned by their parent Elements.
 *
 * @returns {widgets.Element} The found element
 */
WindowWrapper.prototype.findElement =
function WindowWrapper_findElement(aLocatorType, aLocator, aElementClass, aOwner) {
  if (typeof aElementClass === 'undefined')
    aElementClass = 'Widget';
  if (typeof aOwner === 'undefined')
    aOwner = this.innerWindow.document;

  return new widgets[aElementClass](aLocatorType, aLocator, aOwner);
}


/**
 * Get a content window wrapper for the specified window
 *
 * @param {Window} aWindow Window to create the wrapper for
 * @param {Class} [aWindowClass=ContentWindowWrapper] Content window wrapper class
 *
 * @returns {ContentWindow} New content window wrapper
 */
WindowWrapper.prototype.getContentWindow =
function WindowWrapper_getContentWindow(aWindow, aWindowClass) {
  if (typeof aWindowClass === 'undefined')
    aWindowClass = ContentWindowWrapper;

  return new aWindowClass(aWindow);
}


/**
 * Press a key for the entire window
 * Try to avoid the usage of the ctrlKey and metaKey modifiers if the
 * shortcut is a combination of Ctrl (Windows/Linux) and Cmd (Mac). In
 * this case, use accelKey instead which will work across operating systems.
 *
 * @param {String} aKeyCode Either a literal like 'b' or an enum like 'VK_ESCAPE'.
 * @param {Object} [aModifiers={}] Indicates modifier keys. true means pressed.
 * @param {Boolean} [aModifiers.ctrlKey=false] The Ctrl key.
 * @param {Boolean} [aModifiers.altKey=false] The Alt/Option key.
 * @param {Boolean} [aModifiers.shiftKey=false] The Shift key.
 * @param {Boolean} [aModifiers.metaKey=false] The Meta/Cmd key.
 * @param {Boolean} [aModifiers.accelKey=false] Ctrl key on Windows/Linux,
 *                                              Cmd key on Mac.
 * @return {Boolean} true if succeeded, false otherwise.
 */
WindowWrapper.prototype.keypress = function WindowWrapper_keypress(aKeyCode, aModifiers) {
  aModifiers = aModifiers || {};
  return this._controller.keypress(null, aKeyCode, aModifiers);
}


/**
 * Passthrough to element.addEventListener as in MDC
 * @see <a href="https://developer.mozilla.org/en/DOM/element.addEventListener">element.addEventListener</a>
 */
WindowWrapper.prototype.addEventListener =
function WindowWrapper_addEventListener(aType, aListener, aUseCapture,
                                        aWantsUntrusted) {
  this.innerWindow.addEventListener(aType, aListener, aUseCapture, aWantsUntrusted);
}


/**
 * Passthrough to element.removeEventListener as in MDC
 * @see <a href="https://developer.mozilla.org/en/DOM/element.removeEventListener">element.removeEventListener</a>
 */
WindowWrapper.prototype.removeEventListener =
function WindowWrapper_removeEventListener(aType, aListener, aUseCapture) {
  this.innerWindow.removeEventListener(aType, aListener, aUseCapture);
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
function ChromeWindowWrapper(aDOMWindow) {
  // If aDOMWindow is undefined, this is a prototype and we should exit now.
  if (!aDOMWindow)
    return;

  // Wait until the DOM window content has been loaded
  driver.waitFor(function () {
    return isWindowLoaded(aDOMWindow);
  }, "Window '" + aDOMWindow + "' has been loaded");

  WindowWrapper.apply(this, arguments);

  // Inject an initial handler to catch an unexpected modal dialog
  this._modalDialog = new ModalDialog(this);
  this._setDefaultModalDialogHandler();
}
inheritance.extend(ChromeWindowWrapper, WindowWrapper);


/**
 * Set our default values for our internal properties
 */
ChromeWindowWrapper.prototype._modalDialog = null;


/**
 * Retrieve the window's title.
 *
 * @returns {String} Title of the window.
 */
ChromeWindowWrapper.prototype.__defineGetter__("title", function ChromeWindowWrapper_getTitle() {
  return this.innerWindow.document.title;
});


/**
 * Retrieve the window's type.
 *
 * @returns {String} Type of the window.
 */
ChromeWindowWrapper.prototype.__defineGetter__("type", function ChromeWindowWrapper_getType() {
  return this.innerWindow.document.documentElement.getAttribute("windowtype");
});


/**
 * Clean-up all allocated instances of class members.
 */
ChromeWindowWrapper.prototype.destroy = function ChromeWindowWrapper_destroy() {
  this._modalDialog.stop();
  delete this._modalDialog;

  WindowWrapper.prototype.destroy.apply(this);
}


/**
 * Find another DOMWindow, optionally as specified by the filter.
 *
 * Will locate the newest window that's not the current window. If filter is
 * given, locates the newest window matching the filter that's not the current
 * window.
 *
 * Will raise an error if the window isn't found in the specified time.
 *
 * @param {Function} [aFilterCallback]
 *        Callback to filter the list of open windows.
 *        @see driver
 * @param {Number} [aTimeout=5000]
 *        Max length of time in ms to wait for the window to appear
 *
 * @returns {DOMWindow} The window
 */
ChromeWindowWrapper.prototype.findWindow =
function ChromeWindowWrapper_findWindow(aFilterCallback, aTimeout) {
  // Define the callback filter used for finding. Can't just use the passed-in
  // one, as we're adding the "not me" consideration.
  function findFilter(aOpener) {
    return function(aWindow) {
             return (aWindow !== aOpener) && aFilterCallback(aWindow);
           }
  }

  // Actually find the window. Note strict=false on getNewestWindow so it
  // won't throw its own exceptions.
  let win = null;
  let self = this;
  driver.waitFor(function () {
    win = driver.getNewestWindow(findFilter(self.innerWindow), false);
    return win !== null;
  }, "Window has been found", aTimeout);

  return win;
}

 /**
 * Handle another DOMWindow as specified by the filter. Locates windows as
 * in ChromeWindowWrapper.findWindow(), above.
 *
 * Will wait up to 5 secs for desired window to appear. Will throw a timeout
 * error if the window does not appear in that time.
 *
 * @param {Function} aFilterCallback
 *        Callback to filter the list of open windows.
 *        @see driver
 * @param {String} aFilterValue
 *        Value which gets checked in the filter callback.
 * @param {Function} aCallback
 *        Callback to execute for the target window.
 * @param {Boolean} [aClose=true]
 *        Flag to indicate if the window has to be closed.
 *
 * @returns {ChromeWindowWrapper} The window. If aClose=true, it will already
 *                                be closed.
 *
 * @see windows.ChromeWindowWrapper.findWindow
 */
ChromeWindowWrapper.prototype.handleWindow =
function ChromeWindowWrapper_handleWindow(aFilterCallback, aCallback, aClose) {
  // Set defaults
  if (typeof aClose === 'undefined') {
    aClose = true;
  }

  // Find the window. This'll throw a timeout if it's not found.
  let win = this.findWindow(aFilterCallback);

  // Execute the callback. Close if requested.
  try {
    aCallback(win);

    if (aClose) {
      win.close();
    }
  }
  catch (e) {
    // In case of an exception, we always close.
    win.close();
    throw e;
  }

  return win;
}


/**
 * Default handler for modal dialogs to catch unexpected dialogs.
 *
 * @param {ChromeWindowWrapper} aWindow Instance of the modal dialog.
 * @private
 */
ChromeWindowWrapper.prototype._defaultModalDialogHandler =
function ChromeWindowWrapper__defaultModalDialogHandler(aWindow) {
  let ident = (aWindow.title || aWindow.type || aWindow.id || 'unknown');
  let message = "A modal '" + ident + "' dialog has been opened unexpectedly."

  throw new errors.UnexpectedError(message);
}


/**
 * Set a default handler to catch unexpected modal dialogs.
 *
 * @private
 */
ChromeWindowWrapper.prototype._setDefaultModalDialogHandler =
function ChromeWindowWrapper__setDefaultModalDialogHandler() {
  this.setModalDialogHandler(this._defaultModalDialogHandler);
}


/**
 * Set a modal dialog handler.
 *
 * @param {function} aCallback
 *        The callback handler to interact with the modal dialog.
 */
ChromeWindowWrapper.prototype.setModalDialogHandler =
function ChromeWindowWrapper_setModalDialogHandler(aCallback) {
  // Stop any existing handler before setting up a new custom handler
  this._modalDialog.stop();
  this._modalDialog.start(aCallback);
}


/**
 * Wait for the modal dialog.
 *
 * @param {Number} [aTimeout=5s] Timeout for waiting for the modal dialog.
 */
ChromeWindowWrapper.prototype.waitForModalDialog =
function ChromeWindowWrapper_waitForModalDialog(aTimeout) {
  try {
    this._modalDialog.waitForDialog(aTimeout);
  }
  finally {
    // Revert to default handler
    this._setDefaultModalDialogHandler();
  }
}


/**
 * Creates a new instance of a content window wrapper.
 *
 * @constructor
 * @class Wrapper for content windows and frames
 *
 * @param {ContentWindow} [aContentWindow=null]
 *        Content window which has to be wrapped.
 */
function ContentWindowWrapper(aContentWindow) {
  WindowWrapper.apply(this, arguments);
}
inheritance.extend(ContentWindowWrapper, WindowWrapper);


/**
 * Check if the window content has been finished loading
 *
 * @memberOf windows
 * @param {Window} aWindow
 *        Window instance to check
 * @returns {Boolean} True, if the window content has been loaded
 */
function isWindowLoaded(aWindow) {
  return ("mozmillDocumentLoaded" in aWindow) &&
         aWindow.mozmillDocumentLoaded;
}


// Export of classes
windows.WindowWrapper = WindowWrapper;
windows.ChromeWindowWrapper = ChromeWindowWrapper;
windows.ContentWindowWrapper = ContentWindowWrapper;

// Export of functions
windows.isWindowLoaded = isWindowLoaded;
