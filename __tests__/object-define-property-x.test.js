let defineProperty;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  defineProperty = require('../../index.js');
} else {
  defineProperty = returnExports;
}

const has = Object.prototype.hasOwnProperty;
const supportsAccessors = has.call(Object.prototype, '__defineGetter__');

const itHasAccessors = supportsAccessors ? it : xit;
const itHasNoAccessors = supportsAccessors ? xit : it;
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const itHasSymbols = hasSymbols ? it : xit;
const doc = typeof document !== 'undefined' && document;
const itHasDoc = doc ? it : xit;

describe('defineProperty', function() {
  let obj;

  beforeEach(function() {
    obj = {};

    defineProperty(obj, 'name', {
      configurable: true,
      enumerable: true,
      value: 'Testing',
      writable: true,
    });
  });

  it('should return the initial value', function() {
    expect(has.call(obj, 'name')).toBeTruthy();
    expect(obj.name).toBe('Testing');
  });

  it('should be setable', function() {
    obj.name = 'Other';
    expect(obj.name).toBe('Other');
  });

  it('should return the parent initial value', function() {
    const child = Object.create(obj, {});

    expect(child.name).toBe('Testing');
    expect(has.call(child, 'name')).toBeFalsy();
  });

  it('should not override the parent value', function() {
    const child = Object.create(obj, {});

    defineProperty(child, 'name', {value: 'Other'});

    expect(obj.name).toBe('Testing');
    expect(child.name).toBe('Other');
  });

  it('should throw error for non object', function() {
    expect(function() {
      defineProperty(42, 'name', {});
    }).toThrow();
  });

  it('should not throw error for empty descriptor', function() {
    expect(function() {
      defineProperty({}, 'name', {});
    }).not.toThrow();
  });

  it('should throw error if getter is not a function', function() {
    expect(function() {
      defineProperty({}, 'name', {
        get: null,
      });
    }).toThrow();
  });

  it('should throw error if getter and value defined', function() {
    expect(function() {
      defineProperty({}, 'name', {
        get() {},
        value: null,
      });
    }).toThrow();
  });

  it('should throw error if getter and writeable is truthy', function() {
    expect(function() {
      defineProperty({}, 'name', {
        get() {},
        writable: true,
      });
    }).toThrow();
  });

  it('should throw error if setter is not a function', function() {
    expect(function() {
      defineProperty({}, 'name', {
        set: null,
      });
    }).toThrow();
  });

  it('should throw error if setter and value defined', function() {
    expect(function() {
      defineProperty({}, 'name', {
        set() {},
        value: null,
      });
    }).toThrow();
  });

  it('should throw error if setter and writeable is truthy', function() {
    expect(function() {
      defineProperty({}, 'name', {
        set() {},
        writable: true,
      });
    }).toThrow();
  });

  itHasAccessors('should not throw error if has accessers', function() {
    defineProperty({}, 'name', {
      get() {},
      set() {},
    });
  });

  itHasNoAccessors('should throw error if no accessers available', function() {
    expect(function() {
      defineProperty({}, 'name', {
        get() {},
        set() {},
      });
    }).toThrow();
  });

  itHasSymbols('works with Symbols', function() {
    const symbol = Symbol('');
    const objSym = Object(symbol);
    obj = {};
    defineProperty(obj, objSym, {value: 1});
    expect(obj[symbol]).toBe(1);
  });

  itHasDoc('works with DOM elements', function() {
    const div = document.createElement('div');
    defineProperty(div, 'blah', {value: 1});
    expect(div.blah).toBe(1);
  });
});
