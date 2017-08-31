'use strict';

var defineProperty;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  var es7 = require('es7-shim');
  Object.keys(es7).forEach(function (key) {
    var obj = es7[key];
    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  defineProperty = require('../../index.js');
} else {
  defineProperty = returnExports;
}

var hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
var itHasSymbols = hasSymbols ? it : xit;
var documentElement = typeof document !== 'undefined' && document.documentElement;
var itHasDocumentElement = documentElement ? it : xit;
var has = Object.prototype.hasOwnProperty;

describe('defineProperty', function () {
  var obj;

  beforeEach(function () {
    obj = {};

    defineProperty(obj, 'name', {
      configurable: true,
      enumerable: true,
      value: 'Testing',
      writable: true
    });
  });

  it('should return the initial value', function () {
    expect(has.call(obj, 'name')).toBeTruthy();
    expect(obj.name).toBe('Testing');
  });

  it('should be setable', function () {
    obj.name = 'Other';
    expect(obj.name).toBe('Other');
  });

  it('should return the parent initial value', function () {
    var child = Object.create(obj, {});

    expect(child.name).toBe('Testing');
    expect(has.call(child, 'name')).toBeFalsy();
  });

  it('should not override the parent value', function () {
    var child = Object.create(obj, {});

    defineProperty(child, 'name', { value: 'Other' });

    expect(obj.name).toBe('Testing');
    expect(child.name).toBe('Other');
  });

  it('should throw error for non object', function () {
    expect(function () {
      defineProperty(42, 'name', {});
    }).toThrow();
  });

  it('should not throw error for empty descriptor', function () {
    expect(function () {
      defineProperty({}, 'name', {});
    }).not.toThrow();
  });

  itHasSymbols('works with Symbols', function () {
    var symbol = Symbol('');
    var objSym = Object(symbol);
    obj = {};
    defineProperty(obj, objSym, { value: 1 });
    expect(obj[symbol]).toBe(1);
  });

  itHasDocumentElement('works with DOM elements', function () {
    var div = document.createElement('div');
    defineProperty(div, 'blah', { value: 1 });
    expect(div.blah).toBe(1);
  });
});
