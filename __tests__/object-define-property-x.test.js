import defineProperty from '../src/object-define-property-x';

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
    expect.assertions(2);
    expect(has.call(obj, 'name')).toBe(true);
    expect(obj.name).toBe('Testing');
  });

  it('should be setable', function() {
    expect.assertions(1);
    obj.name = 'Other';
    expect(obj.name).toBe('Other');
  });

  it('should return the parent initial value', function() {
    expect.assertions(2);
    const child = Object.create(obj, {});

    expect(child.name).toBe('Testing');
    expect(has.call(child, 'name')).toBe(false);
  });

  it('should not override the parent value', function() {
    expect.assertions(2);
    const child = Object.create(obj, {});

    defineProperty(child, 'name', {value: 'Other'});

    expect(obj.name).toBe('Testing');
    expect(child.name).toBe('Other');
  });

  it('should throw error for non object', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty(42, 'name', {});
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not throw error for empty descriptor', function() {
    expect.assertions(1);
    defineProperty({}, 'name', {});
    expect(true).toBe(true);
  });

  it('should throw error if getter is not a function', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty({}, 'name', {
        get: null,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if getter and value defined', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty({}, 'name', {
        get() {},
        value: null,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if getter and writeable is truthy', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty({}, 'name', {
        get() {},
        writable: true,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if setter is not a function', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty({}, 'name', {
        set: null,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if setter and value defined', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty({}, 'name', {
        set() {},
        value: null,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if setter and writeable is truthy', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty({}, 'name', {
        set() {},
        writable: true,
      });
    }).toThrowErrorMatchingSnapshot();
  });

  itHasAccessors('should not throw error if has accessers', function() {
    expect.assertions(1);
    defineProperty({}, 'name', {
      get() {},

      set() {},
    });

    expect(true).toBe(true);
  });

  itHasNoAccessors('should throw error if no accessers available', function() {
    expect.assertions(1);
    expect(function() {
      defineProperty({}, 'name', {
        get() {},

        set() {},
      });
    }).toThrowErrorMatchingSnapshot();
  });

  itHasSymbols('works with Symbols', function() {
    expect.assertions(1);

    const symbol = Symbol('');
    const objSym = Object(symbol);
    obj = {};
    defineProperty(obj, objSym, {value: 1});
    expect(obj[symbol]).toBe(1);
  });

  itHasDoc('works with DOM elements', function() {
    expect.assertions(1);
    const div = document.createElement('div');
    defineProperty(div, 'blah', {value: 1});
    expect(div.blah).toBe(1);
  });
});
