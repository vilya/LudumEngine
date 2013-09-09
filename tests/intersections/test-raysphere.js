module("intersections/raysphere");


test("ray from origin along -z", function () {
  var raysphere = new ludum.RaySphereIntersector();
  raysphere.setRaySrc(0, 0, 0);
  raysphere.setRayDir(0, 0, -1);

  raysphere.setSphere(0, 0, -10, 1);  // Sphere of radius 1, centered at 0,0,-10
  ok(raysphere.shadowIntersect(0, 100), "Ray hits sphere.");
  equal(raysphere.intersect(0, 100), 9, "Ray hits sphere at a distance of 9 units.");
  ok(!raysphere.shadowIntersect(0, 5),  "Ray doesn't hit sphere when tMax is less than 9.");

  raysphere.setSphere(0, 0, 10, 1); // Sphere of radius 1 centered at 0,0,10.
  ok(!raysphere.shadowIntersect(0, 100), "Ray doesn't hit sphere behind it.");
  equal(raysphere.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raysphere.setSphere(10, 0, 0, 1); // Sphere of radius 1 centered at 10,0,0.
  ok(!raysphere.shadowIntersect(0, 100), "Ray doesn't hit sphere to the right of it.");
  equal(raysphere.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raysphere.setSphere(-10, 0, 0, 1); // Sphere of radius 1 centered at -10,0,0.
  ok(!raysphere.shadowIntersect(0, 100), "Ray doesn't hit sphere to the left of it.");
  equal(raysphere.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raysphere.setSphere(0, 10, 0, 1); // Sphere of radius 1 centered at 0,10,0.
  ok(!raysphere.shadowIntersect(0, 100), "Ray doesn't hit sphere above it.");
  equal(raysphere.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");

  raysphere.setSphere(0, -10, 0, 1); // Sphere of radius 1 centered at 0,-10,0.
  ok(!raysphere.shadowIntersect(0, 100), "Ray doesn't hit sphere below it.");
  equal(raysphere.intersect(0, 100), Number.POSITIVE_INFINITY, "Hit distance set to positive infinity.");
});


test("ray pointing at origin", function () {
  var raysphere = new ludum.RaySphereIntersector();
  raysphere.setSphere(0, 0, 0, 1); // Sphere of radius 1 centered at the origin.

  raysphere.setRaySrc(0, 0, 10);
  raysphere.setRayDir(0, 0, -1);
  ok(raysphere.shadowIntersect(0, 100), "Ray from z = 10 hits sphere.");
  equal(raysphere.intersect(0, 100), 9, "Ray from z = 10 hits sphere at a distance of 9 units.");
  ok(!raysphere.shadowIntersect(0, 5),  "Ray from z = 10 doesn't hit sphere when tMax is less than 9.");

  raysphere.setRaySrc(0, 0, -10);
  raysphere.setRayDir(0, 0, 1);
  ok(raysphere.shadowIntersect(0, 100), "Ray from z = -10 hits sphere.");
  equal(raysphere.intersect(0, 100), 9, "Ray from z = -10 hits sphere at a distance of 9 units.");
  ok(!raysphere.shadowIntersect(0, 5),  "Ray from z = -10 doesn't hit sphere when tMax is less than 9.");

  raysphere.setRaySrc(10, 0, 0);
  raysphere.setRayDir(-1, 0, 0);
  ok(raysphere.shadowIntersect(0, 100), "Ray from x = 10 hits sphere.");
  equal(raysphere.intersect(0, 100), 9, "Ray from x = 10 hits sphere at a distance of 9 units.");
  ok(!raysphere.shadowIntersect(0, 5),  "Ray from x = 10 doesn't hit sphere when tMax is less than 9.");

  raysphere.setRaySrc(-10, 0, 0);
  raysphere.setRayDir(1, 0, 0);
  ok(raysphere.shadowIntersect(0, 100), "Ray from x = -10 hits sphere.");
  equal(raysphere.intersect(0, 100), 9, "Ray from x = -10 hits sphere at a distance of 9 units.");
  ok(!raysphere.shadowIntersect(0, 5),  "Ray from x = -10 doesn't hit sphere when tMax is less than 9.");

  raysphere.setRaySrc(0, 10, 0);
  raysphere.setRayDir(0, -1, 0);
  ok(raysphere.shadowIntersect(0, 100), "Ray from y = 10 hits sphere.");
  equal(raysphere.intersect(0, 100), 9, "Ray from y = 10 hits sphere at a distance of 9 units.");
  ok(!raysphere.shadowIntersect(0, 5),  "Ray from y = 10 doesn't hit sphere when tMax is less than 9.");

  raysphere.setRaySrc(0, -10, 0);
  raysphere.setRayDir(0, 1, 0);
  ok(raysphere.shadowIntersect(0, 100), "Ray from y = -10 hits sphere.");
  equal(raysphere.intersect(0, 100), 9, "Ray from y = -10 hits sphere at a distance of 9 units.");
  ok(!raysphere.shadowIntersect(0, 5),  "Ray from y = -10 doesn't hit sphere when tMax is less than 9.");
});


test("non-axis aligned ray pointing at the origin", function () {
  var raysphere = new ludum.RaySphereIntersector();
  raysphere.setRaySrc(5, 6, 7);
  raysphere.setRayDir(-5, -6, -7, true);
  raysphere.setSphere(0, 0, 0, 1); // Sphere of radius 1 centered at the origin.

  ok(raysphere.shadowIntersect(1, 100),  "Ray hits sphere.");

  var distance = raysphere.intersect(1, 100);
  ok(distance > 0.0,    "Ray hits sphere at distance > the minimum.");
  ok(distance < 100.0,  "Ray hits sphere at distance < the maximum.");

  ok(!raysphere.shadowIntersect(1, distance - 0.1),            "Ray doesn't hit sphere if it falls short.");
  ok(!raysphere.shadowIntersect(distance + 10, distance + 20), "Ray doesn't hit sphere when the minimum distance is further than the sphere.");
});


test("non-axis aligned ray pointing away from the origin", function () {
  var raysphere = new ludum.RaySphereIntersector();
  raysphere.setRaySrc(5, 6, 7);
  raysphere.setRayDir(-1, -2, -3, true);
  raysphere.setSphere(2, 0, -2, 1); // Sphere of radius 1 centered at 2,0,-2 (the result of raySrc + 3 * rayDir)

  ok(raysphere.shadowIntersect(1, 100),  "Ray hits sphere.");

  var distance = raysphere.intersect(1, 100);
  ok(distance > 0.0,    "Ray hits sphere at distance > the minimum.");
  ok(distance < 100.0,  "Ray hits sphere at distance < the maximum.");

  ok(!raysphere.shadowIntersect(1, distance - 0.1),            "Ray doesn't hit sphere if it falls short.");
  ok(!raysphere.shadowIntersect(distance + 10, distance + 20), "Ray doesn't hit sphere when the minimum distance is further than the sphere.");
});
