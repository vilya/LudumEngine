module("intersections/raybox");


test("ray from origin along -z", function () {
  var raybox = new ludum.RayBoxIntersector();
  raybox.setRaySrc(0, 0, 0);
  raybox.setRayDir(0, 0, -1);

  raybox.setBox(-1, -1, -11, 1, 1, -9);  // 2x2x2 cube centered at 0,0,-10
  ok(raybox.shadowIntersect(0, 100), "Ray hits box.");
  equal(raybox.intersect(0, 100), 9, "Ray hits box at a distance of 9 units.");
  ok(!raybox.shadowIntersect(0, 5),  "Ray doesn't hit box when tMax is less than 9.");

  raybox.setBox(-1, -1, 9, 1, 1, 11); // 2x2x2 cube centered at 0,0,10.
  ok(!raybox.shadowIntersect(0, 100), "Ray doesn't hit box behind it.");
  equal(raybox.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raybox.setBox(9, -1, -1, 11, 1, 1); // 2x2x2 cube centered at 10,0,0.
  ok(!raybox.shadowIntersect(0, 100), "Ray doesn't hit box to the right of it.");
  equal(raybox.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raybox.setBox(-11, -1, -1, -9, 1, 1); // 2x2x2 cube centered at -10,0,0.
  ok(!raybox.shadowIntersect(0, 100), "Ray doesn't hit box to the left of it.");
  equal(raybox.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raybox.setBox(-1, 9, -1, 1, 11, 1); // 2x2x2 cube centered at 0,10,0.
  ok(!raybox.shadowIntersect(0, 100), "Ray doesn't hit box above it.");
  equal(raybox.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raybox.setBox(-1, -11, -1, 1, -9, 1); // 2x2x2 cube centered at 0,-10,0.
  ok(!raybox.shadowIntersect(0, 100), "Ray doesn't hit box below it.");
  equal(raybox.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");
});


test("ray pointing at origin", function () {
  var raybox = new ludum.RayBoxIntersector();
  raybox.setBox(-1, -1, -1, 1, 1, 1); // 2x2x2 cube centered at the origin.

  raybox.setRaySrc(0, 0, 10);
  raybox.setRayDir(0, 0, -1);
  ok(raybox.shadowIntersect(0, 100), "Ray from z = 10 hits box.");
  equal(raybox.intersect(0, 100), 9, "Ray from z = 10 hits box at a distance of 9 units.");
  ok(!raybox.shadowIntersect(0, 5),  "Ray from z = 10 doesn't hit box when tMax is less than 9.");

  raybox.setRaySrc(0, 0, -10);
  raybox.setRayDir(0, 0, 1);
  ok(raybox.shadowIntersect(0, 100), "Ray from z = -10 hits box.");
  equal(raybox.intersect(0, 100), 9, "Ray from z = -10 hits box at a distance of 9 units.");
  ok(!raybox.shadowIntersect(0, 5),  "Ray from z = -10 doesn't hit box when tMax is less than 9.");

  raybox.setRaySrc(10, 0, 0);
  raybox.setRayDir(-1, 0, 0);
  ok(raybox.shadowIntersect(0, 100), "Ray from x = 10 hits box.");
  equal(raybox.intersect(0, 100), 9, "Ray from x = 10 hits box at a distance of 9 units.");
  ok(!raybox.shadowIntersect(0, 5),  "Ray from x = 10 doesn't hit box when tMax is less than 9.");

  raybox.setRaySrc(-10, 0, 0);
  raybox.setRayDir(1, 0, 0);
  ok(raybox.shadowIntersect(0, 100), "Ray from x = -10 hits box.");
  equal(raybox.intersect(0, 100), 9, "Ray from x = -10 hits box at a distance of 9 units.");
  ok(!raybox.shadowIntersect(0, 5),  "Ray from x = -10 doesn't hit box when tMax is less than 9.");

  raybox.setRaySrc(0, 10, 0);
  raybox.setRayDir(0, -1, 0);
  ok(raybox.shadowIntersect(0, 100), "Ray from y = 10 hits box.");
  equal(raybox.intersect(0, 100), 9, "Ray from y = 10 hits box at a distance of 9 units.");
  ok(!raybox.shadowIntersect(0, 5),  "Ray from y = 10 doesn't hit box when tMax is less than 9.");

  raybox.setRaySrc(0, -10, 0);
  raybox.setRayDir(0, 1, 0);
  ok(raybox.shadowIntersect(0, 100), "Ray from y = -10 hits box.");
  equal(raybox.intersect(0, 100), 9, "Ray from y = -10 hits box at a distance of 9 units.");
  ok(!raybox.shadowIntersect(0, 5),  "Ray from y = -10 doesn't hit box when tMax is less than 9.");
});


test("non-axis aligned ray pointing at the origin", function () {
  var raybox = new ludum.RayBoxIntersector();
  raybox.setRaySrc(5, 6, 7);
  raybox.setRayDir(-5, -6, -7, true);
  raybox.setBox(-1, -1, -1, 1, 1, 1); // 2x2x2 cube centered at the origin.

  ok(raybox.shadowIntersect(1, 100),  "Ray hits box.");

  var distance = raybox.intersect(1, 100);
  ok(distance > 0.0,    "Ray hits box at distance > the minimum.");
  ok(distance < 100.0,  "Ray hits box at distance < the maximum.");

  ok(!raybox.shadowIntersect(1, distance - 0.1),            "Ray doesn't hit box if it falls short.");
  ok(!raybox.shadowIntersect(distance + 10, distance + 20), "Ray doesn't hit box when the minimum distance is further than the box.");
});


test("non-axis aligned ray pointing away from the origin", function () {
  var raybox = new ludum.RayBoxIntersector();
  raybox.setRaySrc(5, 6, 7);
  raybox.setRayDir(-1, -2, -3, true);
  raybox.setBox(1, -1, -3, 3, 1, -1); // 2x2x2 cube centered at 2,0,-2 (the result of raySrc + 3 * rayDir)

  ok(raybox.shadowIntersect(1, 100),  "Ray hits box.");

  var distance = raybox.intersect(1, 100);
  ok(distance > 0.0,    "Ray hits box at distance > the minimum.");
  ok(distance < 100.0,  "Ray hits box at distance < the maximum.");

  ok(!raybox.shadowIntersect(1, distance - 0.1),            "Ray doesn't hit box if it falls short.");
  ok(!raybox.shadowIntersect(distance + 10, distance + 20), "Ray doesn't hit box when the minimum distance is further than the box.");
});
