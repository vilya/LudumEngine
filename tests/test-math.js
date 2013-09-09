module("math");


test("radians", function () {
  equal(ludum.radians(0),     0,                    "0 degrees = 0 radians");
                                                    
  equal(ludum.radians(90.0),  Math.PI / 2.0,        "90 degrees = PI/2 radians");
  equal(ludum.radians(180.0), Math.PI,              "180 degrees = PI radians");
  equal(ludum.radians(270.0), Math.PI * 3.0 / 2.0,  "270 degrees = 1.5 * PI radians");
  equal(ludum.radians(360.0), Math.PI * 2.0,        "360 degrees = 2 * PI radians");
                                                    
  equal(ludum.radians(-90),   -Math.PI / 2.0,       "-90 degrees = -PI/2 radians");
  equal(ludum.radians(-180),  -Math.PI,             "-180 degrees = -PI radians");
  equal(ludum.radians(-270),  -Math.PI * 3.0 / 2.0, "-270 degrees = -1.5 * PI radians");
  equal(ludum.radians(-360),  -Math.PI * 2.0,       "-360 degrees = -2 * PI radians");
});


test("degrees", function () {
  equal(ludum.degrees(0),                     0,    "0 radians = 0 degrees");
                                                    
  equal(ludum.degrees(Math.PI / 2.0),         90,   "PI/2 radians = 90 degrees");
  equal(ludum.degrees(Math.PI),               180,  "PI radians = 180 degrees");
  equal(ludum.degrees(Math.PI * 3.0 / 2.0),   270,  "1.5 * PI radians = 270 degrees");
  equal(ludum.degrees(Math.PI * 2.0),         360,  "2 * PI radians = 360 degrees");
                                                    
  equal(ludum.degrees(-Math.PI / 2.0),        -90,  "-PI/2 radians = -90 degrees");
  equal(ludum.degrees(-Math.PI),              -180, "-PI radians = -180 degrees");
  equal(ludum.degrees(-Math.PI * 3.0 / 2.0),  -270, "-1.5 * PI radians = -270 degrees");
  equal(ludum.degrees(-Math.PI * 2.0),        -360, "-2 * PI radians = -360 degrees");
});


test("roundTo", function () {
  equal(ludum.roundTo(1.23432, 3),  "1.234",  "Rounds down when necessary.");
  equal(ludum.roundTo(1.23456, 3),  "1.235",  "Rounds up when necessary.");
  equal(ludum.roundTo(-1.23432, 3), "-1.234", "Rounds negative numbers down when necessary.");
  equal(ludum.roundTo(-1.23456, 3), "-1.235", "Rounds negative numbers up when necessary.");
  equal(ludum.roundTo(1.23456, 0),  "1",      "Produces an int when decimalPlaces = 0.");
  equal(ludum.roundTo(0.55, 1),     "0.6",    "Prefers to round away from zero, not towards odd digits.");
  equal(ludum.roundTo(0.65, 1),     "0.7",    "Prefers to round away from zero, not towards even digits.");
  equal(ludum.roundTo(-0.55, 1),    "-0.6",   "Prefers to round away from zero when negative, not towards even digits.");
  equal(ludum.roundTo(-0.65, 1),    "-0.7",   "Prefers to round away from zero when negative, not towards odd digits.");
});


test("clamp", function () {
  equal(ludum.clamp(2.9, 2.0, 4.0),      2.9, "Value in range stays unchanged.");
  equal(ludum.clamp(4.1, 2.0, 4.0),      4.0, "Too-large value gets clamped to the top of the range.");
  equal(ludum.clamp(1.7, 2.0, 4.0),      2.0, "Too-small value gets clamped to the bottom of the range.");
                                              
  equal(ludum.clamp(-2.9, -4.0, -2.0),  -2.9, "Value in range stays unchanged even when negative.");
  equal(ludum.clamp(-4.1, -4.0, -2.0),  -4.0, "Too-large value gets clamped to the top of the range even when negative.");
  equal(ludum.clamp(-1.7, -4.0, -2.0),  -2.0, "Too-small value gets clamped to the bottom of the range even when negative.");
});


test("saturate", function () {
  equal(ludum.saturate(0.5),   0.5, "Value between 0.0 and 1.0 stays unchanged.");
  equal(ludum.saturate(4.0),   1.0, "Value greater than 1.0 gets clamped to 1.0.");
  equal(ludum.saturate(-1.7),  0.0, "Value less than 0.0 gets clamped to 0.0.");
});
