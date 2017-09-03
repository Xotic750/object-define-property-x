/**
 * @file Sham for Object.defineProperty
 * @version 3.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-property-x
 */

'use strict';

var owns = require('has-own-property-x');
var toPropertyKey = require('to-property-key-x');
var isFalsey = require('is-falsey-x');
var attempt = require('attempt-x');
var nativeDefProp = typeof Object.defineProperty === 'function' && Object.defineProperty;
var prototypeOfObject = Object.prototype;
var definePropertyFallback;
// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
if (supportsAccessors) {
  /* eslint-disable no-underscore-dangle, no-restricted-properties */
  defineGetter = prototypeOfObject.__defineGetter__;
  defineSetter = prototypeOfObject.__defineSetter__;
  lookupGetter = prototypeOfObject.__lookupGetter__;
  lookupSetter = prototypeOfObject.__lookupSetter__;
  /* eslint-enable no-underscore-dangle, no-restricted-properties */
}

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/es-shims/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

var testWorksWith = function _testWorksWith(object, prop) {
  var testResult = attempt(nativeDefProp, object, prop, {});
  return testResult.threw === false && prop in testResult.value;
};

var $defineProperty;
// check whether defineProperty works if it's given. Otherwise, shim partially.
if (nativeDefProp) {
  var worksWithDOM = typeof document === 'undefined' || testWorksWith(document.createElement('div'), 'sentinel');
  if (worksWithDOM) {
    var worksWithObject = testWorksWith({}, 'sentinel');
    if (worksWithObject) {
      var worksWithObjSym = require('has-symbol-support-x') && testWorksWith({}, Object(Symbol('')));
      if (worksWithObjSym) {
        $defineProperty = nativeDefProp;
      } else {
        $defineProperty = function defineProperty(object, property, descriptor) {
          return nativeDefProp(object, toPropertyKey(property), descriptor);
        };
      }
    } else {
      definePropertyFallback = nativeDefProp;
    }
  }
}

if (isFalsey($defineProperty) || definePropertyFallback) {
  var assertIsObject = require('assert-is-object-x');
  $defineProperty = function defineProperty(object, property, descriptor) {
    assertIsObject(object);
    var propKey = toPropertyKey(property);
    assertIsObject(descriptor);

    // make a valiant attempt to use the real defineProperty for I8's DOM elements.
    if (definePropertyFallback) {
      var result = attempt.call(Object, definePropertyFallback, object, propKey, descriptor);
      if (result.threw === false) {
        return result.value;
      }
      // try the shim if the real one doesn't work
    }

    // If it's a data property.
    if ('value' in descriptor) {
      // fail silently if 'writable', 'enumerable', or 'configurable'
      // are requested but not supported
      /*
      // alternate approach:
      if ( // can't implement these features; allow false but not true
          ('writable' in descriptor && !descriptor.writable) ||
          ('enumerable' in descriptor && !descriptor.enumerable) ||
          ('configurable' in descriptor && !descriptor.configurable)
      ))
          throw new RangeError(
            'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
          );
      */

      if (supportsAccessors && (lookupGetter.call(object, propKey) || lookupSetter.call(object, propKey))) {
        // As accessors are supported only on engines implementing
        // `__proto__` we can safely override `__proto__` while defining
        // a property to make sure that we don't hit an inherited
        // accessor.
        /* eslint-disable no-proto */
        var prototype = object.__proto__;
        object.__proto__ = prototypeOfObject;
        // Deleting a property anyway since getter / setter may be
        // defined on object itself.
        delete object[propKey];
        object[propKey] = descriptor.value;
        // Setting original `__proto__` back now.
        object.__proto__ = prototype;
        /* eslint-enable no-proto */
      } else {
        object[propKey] = descriptor.value;
      }
    } else {
      var hasGetter = 'get' in descriptor;
      var hasSetter = 'set' in descriptor;
      if (isFalsey(supportsAccessors) && (hasGetter || hasSetter)) {
        throw new TypeError('getters & setters can not be defined on this javascript engine');
      }

      // If we got that far then getters and setters can be defined !!
      if (hasGetter) {
        defineGetter.call(object, propKey, descriptor.get);
      }

      if (hasSetter) {
        defineSetter.call(object, propKey, descriptor.set);
      }
    }

    return object;
  };
}

/**
 * This method defines a new property directly on an object, or modifies an
 * existing property on an object, and returns the object.
 *
 * @param {Object} object - The object on which to define the property.
 * @param {string} property - The name of the property to be defined or modified.
 * @param {Object} descriptor - The descriptor for the property being defined or modified.
 * @returns {Object} The object that was passed to the function.
 * @example
 * var defineProperty = require('object-define-property-x');
 *
 * var o = {}; // Creates a new object
 *
 * defineProperty(o, 'a', {
 *   value: 37,
 *   writable: true
 * });
 */
module.exports = $defineProperty;
