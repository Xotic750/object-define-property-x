import attempt from 'attempt-x';
import toObject from 'to-object-x';
import toPropertyKey from 'to-property-key-x';
import has from 'has-own-property-x';
import isFunction from 'is-function-x';
import assertIsObject from 'assert-is-object-x';
import toBoolean from 'to-boolean-x';

const ObjectCtr = {}.constructor;
const nd = ObjectCtr.defineProperty;
const nativeDefProp = typeof nd === 'function' && nd;
let definePropertyFallback;

const toPropertyDescriptor = function toPropertyDescriptor(desc) {
  const object = toObject(desc);
  const descriptor = {};

  if (has(object, 'enumerable')) {
    descriptor.enumerable = toBoolean(object.enumerable);
  }

  if (has(object, 'configurable')) {
    descriptor.configurable = toBoolean(object.configurable);
  }

  if (has(object, 'value')) {
    descriptor.value = object.value;
  }

  if (has(object, 'writable')) {
    descriptor.writable = toBoolean(object.writable);
  }

  if (has(object, 'get')) {
    const getter = object.get;

    if (typeof getter !== 'undefined' && isFunction(getter) === false) {
      throw new TypeError('getter must be a function');
    }

    descriptor.get = getter;
  }

  if (has(object, 'set')) {
    const setter = object.set;

    if (typeof setter !== 'undefined' && isFunction(setter) === false) {
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

/**
 * This method defines a new property directly on an object, or modifies an
 * existing property on an object, and returns the object.
 *
 * @param {object} object - The object on which to define the property.
 * @param {string} property - The name of the property to be defined or modified.
 * @param {object} descriptor - The descriptor for the property being defined or modified.
 * @returns {object} The object that was passed to the function.
 * });.
 */
let $defineProperty;

// check whether defineProperty works if it's given. Otherwise, shim partially.
if (nativeDefProp) {
  const testWorksWith = function testWorksWith(object) {
    const testResult = attempt(nativeDefProp, object, 'sentinel', {});

    return testResult.threw === false && testResult.value === object && 'sentinel' in object;
  };

  const doc = typeof document !== 'undefined' && document;

  if (testWorksWith({}) && (toBoolean(doc) === false || testWorksWith(doc.createElement('div')))) {
    $defineProperty = function defineProperty(object, property, descriptor) {
      return nativeDefProp(assertIsObject(object), toPropertyKey(property), toPropertyDescriptor(descriptor));
    };
  } else {
    definePropertyFallback = nativeDefProp;
  }
}

if (toBoolean(nativeDefProp) === false || definePropertyFallback) {
  const prototypeOfObject = ObjectCtr.prototype;
  // If JS engine supports accessors creating shortcuts.
  const supportsAccessors = has(prototypeOfObject, '__defineGetter__');
  /* eslint-disable-next-line no-underscore-dangle */
  const defineGetter = supportsAccessors && prototypeOfObject.__defineGetter_;
  /* eslint-disable-next-line no-underscore-dangle,no-restricted-properties */
  const defineSetter = supportsAccessors && prototypeOfObject.__defineSetter__;
  /* eslint-disable-next-line no-underscore-dangle */
  const lookupGetter = supportsAccessors && prototypeOfObject.__lookupGetter__;
  /* eslint-disable-next-line no-underscore-dangle */
  const lookupSetter = supportsAccessors && prototypeOfObject.__lookupSetter__;

  $defineProperty = function defineProperty(object, property, descriptor) {
    assertIsObject(object);
    const propKey = toPropertyKey(property);
    const propDesc = toPropertyDescriptor(descriptor);

    // make a valiant attempt to use the real defineProperty for IE8's DOM elements.
    if (definePropertyFallback) {
      const result = attempt.call(ObjectCtr, definePropertyFallback, object, propKey, propDesc);

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
        /* eslint-disable-next-line no-proto */
        const prototype = object.__proto__;
        /* eslint-disable-next-line no-proto */
        object.__proto__ = prototypeOfObject;
        // Deleting a property anyway since getter / setter may be defined on object itself.
        delete object[propKey];
        object[propKey] = propDesc.value;
        // Setting original `__proto__` back now.
        /* eslint-disable-next-line no-proto */
        object.__proto__ = prototype;
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

const defProp = $defineProperty;

export default defProp;
