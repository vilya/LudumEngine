module("math");


test("radians", function () {
  equal(0,                    ludum.radians(0), "0 degrees = 0 radians");

  equal(Math.PI / 2.0,        ludum.radians(90.0), "90 degrees = PI/2 radians");
  equal(Math.PI,              ludum.radians(180.0), "180 degrees = PI radians");
  equal(Math.PI * 3.0 / 2.0,  ludum.radians(270.0), "270 degrees = 1.5 * PI radians");
  equal(Math.PI * 2.0,        ludum.radians(360.0), "360 degrees = 2 * PI radians");

  equal(-Math.PI / 2.0,       ludum.radians(-90), "-90 degrees = -PI/2 radians");
  equal(-Math.PI,             ludum.radians(-180), "-180 degrees = -PI radians");
  equal(-Math.PI * 3.0 / 2.0, ludum.radians(-270), "-270 degrees = -1.5 * PI radians");
  equal(-Math.PI * 2.0,       ludum.radians(-360), "-360 degrees = -2 * PI radians");
});


test("degrees", function () {
  equal(0,    ludum.degrees(0),                     "0 radians = 0 degrees");

  equal(90,   ludum.degrees(Math.PI / 2.0),         "PI/2 radians = 90 degrees");
  equal(180,  ludum.degrees(Math.PI),               "PI radians = 180 degrees");
  equal(270,  ludum.degrees(Math.PI * 3.0 / 2.0),   "1.5 * PI radians = 270 degrees");
  equal(360,  ludum.degrees(Math.PI * 2.0),         "2 * PI radians = 360 degrees");

  equal(-90,  ludum.degrees(-Math.PI / 2.0),        "-PI/2 radians = -90 degrees");
  equal(-180, ludum.degrees(-Math.PI),              "-PI radians = -180 degrees");
  equal(-270, ludum.degrees(-Math.PI * 3.0 / 2.0),  "-1.5 * PI radians = -270 degrees");
  equal(-360, ludum.degrees(-Math.PI * 2.0),        "-2 * PI radians = -360 degrees");
});


test("roundTo", function () {
  equal("1.234",  ludum.roundTo(1.23432, 3),  "Rounds down when necessary.");
  equal("1.235",  ludum.roundTo(1.23456, 3),  "Rounds up when necessary.");
  equal("-1.234", ludum.roundTo(-1.23432, 3), "Rounds negative numbers down when necessary.");
  equal("-1.235", ludum.roundTo(-1.23456, 3), "Rounds negative numbers up when necessary.");
  equal("1",      ludum.roundTo(1.23456, 0),  "Produces an int when decimalPlaces = 0.");
  equal("0.6",    ludum.roundTo(0.55, 1),     "Prefers to round away from zero, not towards odd digits.");
  equal("0.7",    ludum.roundTo(0.65, 1),     "Prefers to round away from zero, not towards even digits.");
  equal("-0.6",   ludum.roundTo(-0.55, 1),    "Prefers to round away from zero when negative, not towards even digits.");
  equal("-0.7",   ludum.roundTo(-0.65, 1),    "Prefers to round away from zero when negative, not towards odd digits.");
});


test("clamp", function () {
  equal(2.9, ludum.clamp(2.9, 2.0, 4.0), "Value in range stays unchanged.");
  equal(4.0, ludum.clamp(4.1, 2.0, 4.0), "Too-large value gets clamped to the top of the range.");
  equal(2.0, ludum.clamp(1.7, 2.0, 4.0), "Too-small value gets clamped to the bottom of the range.");

  equal(-2.9, ludum.clamp(-2.9, -4.0, -2.0), "Value in range stays unchanged even when negative.");
  equal(-4.0, ludum.clamp(-4.1, -4.0, -2.0), "Too-large value gets clamped to the top of the range even when negative.");
  equal(-2.0, ludum.clamp(-1.7, -4.0, -2.0), "Too-small value gets clamped to the bottom of the range even when negative.");
});


test("saturate", function () {
  equal(0.5, ludum.saturate(0.5),   "Value between 0.0 and 1.0 stays unchanged.");
  equal(1.0, ludum.saturate(4.0),   "Value greater than 1.0 gets clamped to 1.0.");
  equal(0.0, ludum.saturate(-1.7),  "Value less than 0.0 gets clamped to 0.0.");
});
