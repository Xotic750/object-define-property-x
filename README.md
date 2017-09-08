<a href="https://travis-ci.org/Xotic750/object-define-property-x"
   title="Travis status">
<img
   src="https://travis-ci.org/Xotic750/object-define-property-x.svg?branch=master"
   alt="Travis status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/object-define-property-x"
   title="Dependency status">
<img src="https://david-dm.org/Xotic750/object-define-property-x.svg"
   alt="Dependency status" height="18"/>
</a>
<a href="https://david-dm.org/Xotic750/object-define-property-x#info=devDependencies"
   title="devDependency status">
<img src="https://david-dm.org/Xotic750/object-define-property-x/dev-status.svg"
   alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/object-define-property-x" title="npm version">
<img src="https://badge.fury.io/js/object-define-property-x.svg"
   alt="npm version" height="18"/>
</a>
<a name="module_object-define-property-x"></a>

## object-define-property-x
Sham for Object.defineProperty

**Version**: 4.0.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_object-define-property-x--module.exports"></a>

### `module.exports` ⇒ <code>Object</code> ⏏
This method defines a new property directly on an object, or modifies an
existing property on an object, and returns the object.

**Kind**: Exported member  
**Returns**: <code>Object</code> - The object that was passed to the function.  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | The object on which to define the property. |
| property | <code>string</code> | The name of the property to be defined or modified. |
| descriptor | <code>Object</code> | The descriptor for the property being defined or modified. |

**Example**  
```js
var defineProperty = require('object-define-property-x');

var o = {}; // Creates a new object

defineProperty(o, 'a', {
  value: 37,
  writable: true
});
```
