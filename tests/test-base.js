test("base/hasNameClashes", function () {
  var a = { 'foo': true, 'bar': true };
  var b = { 'bar': true, 'baz': true };
  var c = { 'baz': true, 'qux': true };
  
  ok(ludum.hasNameClashes(a, b), "Name clashes present");
  ok(!ludum.hasNameClashes(a, c), "No name clashes present");
});


test("base/copySymbols", function () {
  var a = { 'foo': 'a', 'bar': true };
  var b = {};
  var c = { 'baz': true };
  var d = { 'foo': 'd' };
  ludum.copySymbols(a, b);
  ludum.copySymbols(a, c);
  ludum.copySymbols(a, d);

  equal(b.foo, 'a', "Copy first symbol.");
  equal(b.bar, true, "Copy second symbol.");
  deepEqual(a, b, "No additional symbols copied over.");
  equal(c.baz, true, "Existing non-clashing symbol not removed or changed.");
  equal(a.foo, d.foo, "Changed the value for the clashing symbol.");
});


test("base/addSymbols", function () {
  var exampleModule = {
    'exampleSymbol1': function () { return true; },
    'exampleSymbol2': function () { return false; },
  };

  ok(!ludum.hasNameClashes(exampleModule, ludum), "No symbols from exampleModule exist prior to addSymbols call.");
  ludum.addSymbols(exampleModule);

  var allSymbolsAdded = true;
  var allSymbolsEqual = true;
  for (var k in exampleModule) {
    if (ludum[k] === undefined)
      allSymbolsAdded = false;
    if (ludum[k] !== exampleModule[k])
      allSymbolsEqual = false;
  }

  ok(allSymbolsAdded, "All symbols from exampleModule added to ludum namespace.")
  ok(allSymbolsEqual, "All symbols from exampleModule have the same value in the ludum namespace.");
});


test("base/addSubmodule", function () {
  var exampleModule = {
    'exampleSymbol1': function () { return true; },
    'exampleSymbol2': function () { return false; },
  };

  equal(ludum.exampleModule, undefined, "ludum.exampleModule doesn't exist prior to addSubmodule call.");
  ludum.addSubmodule("exampleModule", exampleModule);
  equal(exampleModule, ludum.exampleModule, "ludum.exampleModule exists and has correct value after addSubmodule call.");
});


test("base/isValidIdentifier", function () {
  var valid = [ "foo", "_foo", "Foo", "f", "F", "f0", "f_0", "f_", "_2" ];
  var invalid = [ "200", "foo-bar", "foo+bar", "$foo" ];

  for (var i = 0, end = valid.length; i < end; ++i)
    ok(ludum.isValidIdentifier(valid[i], valid[i] + " is a valid identifier."));

  for (var i = 0, end = invalid.length; i < end; ++i)
    ok(!ludum.isValidIdentifier(invalid[i], invalid[i] + " is an invalid identifier."));
});


test("base/require", function () {
  var exceptionThrown;
  
  try {
    ludum.require("addSubmodule", "isValidIdentifier");
    exceptionThrown = false;
  }
  catch (ex) {
    exceptionThrown = true;
  }
  ok(!exceptionThrown, "No exception thrown when symbols do exist.");

  equal(ludum.madeUpSymbol, undefined, "Test symbol doesn't exist before the require call.");
  try {
    ludum.require("", "isValidIdentifier");
    exceptionThrown = false;
  }
  catch (ex) {
    exceptionThrown = true;
  }
  ok(exceptionThrown, "Exception is thrown when symbols don't exist.");
});
