// Always include this file first, before any of the other .js files.

var ludum = (function(){

  //
  // Constants
  //

  var EMPTY_OBJECT = {};
  var IDENTIFIER = /^[a-z_][a-z0-9_]*$/i;


  //
  // Symbol manipulation functions
  //
 
  // Returns true if the same name exists in both objects, ignoring the default
  // object attributes.
  function hasNameClashes(refObj, testObj)
  {
    for (var k in testObj) {
      if (EMPTY_OBJECT[k] !== undefined)
        continue;
      if (refObj[k] !== undefined)
        return true;
    }
    return false;
  }

  
  // Copy all symbols & their values from 'fromObj' into 'toObj', ignoring the
  // default object attributes. This is a shallow copy.
  function copySymbols(fromObj, toObj)
  {
    for (var k in fromObj) {
      if (EMPTY_OBJECT[k] !== undefined)
        continue;
      toObj[k] = fromObj[k];
    }
  }


  // Call this from other .js files to add the symbols they define to the
  // 'ludum' namespace.
  function addSymbols(fromModule)
  {
    if (hasNameClashes(this, fromModule))
      throw new Error("module attempts to redefine an existing symbol.");
    copySymbols(fromModule, this);
  }


  // Add a submodule to the 'ludum' namespace.
  function addSubmodule(name, submodule)
  {
    if (this[name] !== undefined)
      throw new Error("symbol '" + name + "' is already defined");
    this[name] = submodule;
  }


  // Check whether a name is a valid javascript identifier.
  function isValidIdentifier(name)
  {
    return IDENTIFIER.test(name);
  }


  // Check whether all of the given names are provided in the ludum namespace
  // and throw an exception if any of them are missing.
  //
  // Use this when writing a module 'foo' which depends on module 'bar', to
  // check up front whether 'bar' has been included first.
  function require(/* name1, name2, ... */)
  {
    var missingSymbols = [];
    for (var i = 0, end = arguments.length; i < end; ++i) {
      var name = arguments[i];
      if (this[name] === undefined)
        missingSymbols.push(name);
    }

    if (missingSymbols.length > 0)
      throw new Error("missing symbols " + missingSymbols.join(", "));
  }


  //
  // Exports
  //

  return {
    'hasNameClashes': hasNameClashes,
    'copySymbols': copySymbols,
    'addSymbols': addSymbols,
    'addSubmodule': addSubmodule,
    'isValidIdentifier': isValidIdentifier,
    'require': require
  };

}());

