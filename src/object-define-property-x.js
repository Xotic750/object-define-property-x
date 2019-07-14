/**
 * @file Sham for Object.defineProperty.
 * @version 4.1.0.
 * @author Xotic750 <Xotic750@gmail.com>.
 * @copyright  Xotic750.
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module Object-define-property-x.
 */

const attempt = require('attempt-x');
const isFalsey = require('is-falsey-x');
const toObject = require('to-object-x');
const toPropertyKey = require('to-property-key-x');
const has = require('has-own-property-x');
const isFunction = require('is-function-x');
const isUndefined = require('validate.io-undefined');
const assertIsObject = require('assert-is-object-x');

const nativeDefProp = typeof Object.defineProperty === 'function' && Object.defineProperty;
let definePropertyFallback;

const toPropertyDescriptor = function _toPropertyDescriptor(desc) {
  const object = toObject(desc);
  const descriptor = {};

  if (has(object, 'enumerable')) {
    descriptor.enumerable = Boolean(object.enumerable);
  }

  if (has(object, 'configurable')) {
    descriptor.configurable = Boolean(object.configurable);
  }

  if (has(object, 'value')) {
    descriptor.value = object.value;
  }

  if (has(object, 'writable')) {
    descriptor.writable = Boolean(object.writable);
  }

  if (has(object, 'get')) {
    const getter = object.get;

    if (isUndefined(getter) === false && isFunction(getter) === false) {
      throw new TypeError('getter must be a function');
    }

    descriptor.get = getter;
  }

  if (has(object, 'set')) {
    const setter = object.set;

    if (isUndefined(setter) === false && isFunction(setter) === false) {
      throw new TypeError('setter must be a function');
    }

    descriptor.set = setter;
  }

  if ((has(descriptor, 'get') || has(descriptor, 'set')) && (has(descriptor, 'value') || has(descriptor, 'writable'))) {
    throw new TypeError('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
  }

  return descriptor;
};

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

let $defineProperty;

// check whether defineProperty works if it's given. Otherwise, shim partially.
if (nativeDefProp) {
  const testWorksWith = function _testWorksWith(object) {
    const testResult = attempt(nativeDefProp, object, 'sentinel', {});

    return testResult.threw === false && testResult.value === object && 'sentinel' in object;
  };

  const doc = typeof document !== 'undefined' && document;

  if (testWorksWith({}) && (isFalsey(doc) || testWorksWith(doc.createElement('div')))) {
    $defineProperty = function defineProperty(object, property, descriptor) {
      return nativeDefProp(assertIsObject(object), toPropertyKey(property), toPropertyDescriptor(descriptor));
    };
  } else {
    definePropertyFallback = nativeDefProp;
  }
}

if (isFalsey(nativeDefProp) || definePropertyFallback) {
  const prototypeOfObject = Object.prototype;

  // If JS engine supports accessors creating shortcuts.
  let defineGetter;
  let defineSetter;
  let lookupGetter;
  let lookupSetter;
  const supportsAccessors = has(prototypeOfObject, '__defineGetter__');

  if (supportsAccessors) {
    /* eslint-disable no-underscore-dangle, no-restricted-properties */
    defineGetter = prototypeOfObject.__defineGetter__;
    defineSetter = prototypeOfObject.__defineSetter__;
    lookupGetter = prototypeOfObject.__lookupGetter__;
    lookupSetter = prototypeOfObject.__lookupSetter__;
    /* eslint-enable no-underscore-dangle, no-restricted-properties */
  }

  $defineProperty = function defineProperty(object, property, descriptor) {
    assertIsObject(object);
    const propKey = toPropertyKey(property);
    const propDesc = toPropertyDescriptor(descriptor);

    // make a valiant attempt to use the real defineProperty for IE8's DOM elements.
    if (definePropertyFallback) {
      const result = attempt.call(Object, definePropertyFallback, object, propKey, propDesc);

      if (result.threw === false) {
        return result.value;
      }
      // try the shim if the real one doesn't work
    }

    // If it's a data property.
    if (has(propDesc, 'value')) {
      // fail silently if 'writable', 'enumerable', or 'configurable' are requested but not supported
      if (supportsAccessors && (lookupGetter.call(object, propKey) || lookupSetter.call(object, propKey))) {
        // As accessors are supported only on engines implementing
        // `__proto__` we can safely override `__proto__` while defining
        // a property to make sure that we don't hit an inherited accessor.
        /* eslint-disable no-proto */
        const prototype = object.__proto__;
        object.__proto__ = prototypeOfObject;
        // Deleting a property anyway since getter / setter may be defined on object itself.
        delete object[propKey];
        object[propKey] = propDesc.value;
        // Setting original `__proto__` back now.
        object.__proto__ = prototype;
        /* eslint-enable no-proto */
      } else {
        object[propKey] = propDesc.value;
      }
    } else {
      if (supportsAccessors === false && (propDesc.get || propDesc.set)) {
        throw new TypeError('getters & setters can not be defined on this javascript engine');
      }

      // If we got that far then getters and setters can be defined !!
      if (propDesc.get) {
        defineGetter.call(object, propKey, propDesc.get);
      }

      if (propDesc.set) {
        defineSetter.call(object, propKey, propDesc.set);
      }
    }

    return object;
  };
}

/**
 * This method defines a new property directly on an object, or modifies an
 * existing property on an object, and returns the object.
 *
 * @param {object} object - The object on which to define the property.
 * @param {string} property - The name of the property to be defined or modified.
 * @param {object} descriptor - The descriptor for the property being defined or modified.
 * @returns {object} The object that was passed to the function.
 * @example
 * var defineProperty = require('object-define-property-x');.
 *
 * var o = {}; // Creates a new object
 *
 * defineProperty(o, 'a', {
 *   value: 37,
 *   writable: true
 * });
 */
module.exports = $defineProperty;
