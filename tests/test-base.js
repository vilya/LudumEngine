// Include all the necessary ludum.min.js files before this.
if (!ludum)
  throw Error("you must include ludum.min.js before this file");

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

