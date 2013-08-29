// Include all the necessary ludum.min.js files before this.
if (!ludum)
  throw Error("you must include ludum.min.js before this file");

test("base/hasNameClashes", function () {
  var a = { 'foo': true, 'bar': true };
  var b = { 'bar': true, 'baz': true };
  var c = { 'baz': true, 'qux': true };
  ok(hasNameClashes(a, b));
  ok(!hasNameClashes(a, b));
});
