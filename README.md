<a href="https://travis-ci.org/Xotic750/object-define-property-x"
  title="Travis status">
<img
  src="https://travis-ci.org/Xotic750/object-define-property-x.svg?branch=master"
  alt="Travis status" height="18">
</a>
<a href="https://david-dm.org/Xotic750/object-define-property-x"
  title="Dependency status">
<img src="https://david-dm.org/Xotic750/object-define-property-x/status.svg"
  alt="Dependency status" height="18"/>
</a>
<a
  href="https://david-dm.org/Xotic750/object-define-property-x?type=dev"
  title="devDependency status">
<img src="https://david-dm.org/Xotic750/object-define-property-x/dev-status.svg"
  alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/object-define-property-x"
  title="npm version">
<img src="https://badge.fury.io/js/object-define-property-x.svg"
  alt="npm version" height="18">
</a>
<a href="https://www.jsdelivr.com/package/npm/object-define-property-x"
  title="jsDelivr hits">
<img src="https://data.jsdelivr.com/v1/package/npm/object-define-property-x/badge?style=rounded"
  alt="jsDelivr hits" height="18">
</a>

<a name="module_object-define-property-x"></a>

## object-define-property-x

Sham for Object.defineProperties

<a name="exp_module_object-define-property-x--module.exports"></a>

### `module.exports(object, prop, properties)` ⇒ <code>Object</code> ⏏

This method defines new or modifies existing properties directly on an
object, returning the object.

**Kind**: Exported function  
**Returns**: <code>Object</code> - The object that was passed to the function.

| Param      | Type                | Description                                                                                                    |
| ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| object     | <code>Object</code> | The object on which to define or modify properties.                                                            |
| pro        | <code>\*</code>     | The name or Symbol of the property to be defined or modified.                                                  |
| properties | <code>Object</code> | An object whose own enumerable properties constitute descriptors for the properties to be defined or modified. |

**Example**

```js
import defineProperty from 'object-define-property-x';

const obj = {};
defineProperty(obj, 'key', {
  enumerable: false,
  configurable: false,
  writable: false,
  value: 'static',
});
```
