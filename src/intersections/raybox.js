// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){

  //
  // RayBoxIntersector class
  //

  // Class for doing optimised ray-box intersection calculations. It doesn't do
  // any allocations except for in the constructor. It precalculates some
  // values when you set a ray, so that it can efficiently handle testing the
  // same ray against multiple boxes.
  //
  // To use:
  //
  //   var raybox = new RayBoxIntersector();
  //   raybox.setRaySrc(x, y, z);
  //   raybox.setRayDir(nx, ny, nz);
  //   raybox.setBox(xy, yl, zl, zh, yh, zh);
  //   if (raybox.shadowIntersect(t0, t1)) {
  //     ...
  //   }
  //
  // In other words: set the ray src, set the ray direction & set the box; then
  // call the intersection functions.
  //
  // Some notes, to help get the best performance:
  // - Create the RayBoxIntersector once and reuse for all your intersection
  //   tests.
  // - It's cheaper to test the same ray against multiple boxes than to test
  //   the same box against multiple rays.
  // - Changing the ray origin is cheap, changing the ray direction is not.
  function RayBoxIntersector()
  {
    this.raySrc = [ 0.0, 0.0, 0.0 ];
    this.rayDir = [ 0.0, 0.0, -1.0 ];
    this.box = [
      [ 0.0, 0.0, 0.0 ],  // low corner of the box
      [ 1.0, 1.0, 1.0 ]   // high corner of the box
    ];
    this.rayInvDir = [ 0.0, 0.0, 1.0 ];
    this.sign = [ 0, 0, 1 ];
    this.tMin = [ 0.0, 0.0, 0.0 ];
    this.tMax = [ 0.0, 0.0, 0.0 ];
  }


  RayBoxIntersector.prototype = {}


  RayBoxIntersector.prototype.setRaySrc = function (x, y, z)
  {
    this.raySrc[0] = x;
    this.raySrc[1] = y;
    this.raySrc[2] = z;
  }


  RayBoxIntersector.prototype.setRayDir = function (x, y, z, normalize)
  {
    this.rayDir[0] = x;
    this.rayDir[1] = y;
    this.rayDir[2] = z;
    if (normalize) {
      var len = Math.sqrt(x * x + y * y + z * z);
      if (len > 0.0) {
        this.rayDir[0] /= len;
        this.rayDir[1] /= len;
        this.rayDir[2] /= len;
      }
    }
    this.rayInvDir[0] = 1.0 / this.rayDir[0];
    this.rayInvDir[1] = 1.0 / this.rayDir[1];
    this.rayInvDir[2] = 1.0 / this.rayDir[2];
    this.sign[0] = (this.rayInvDir[0] < 0) ? 1 : 0;
    this.sign[1] = (this.rayInvDir[1] < 0) ? 1 : 0;
    this.sign[2] = (this.rayInvDir[2] < 0) ? 1 : 0;
  }


  RayBoxIntersector.prototype.setBox = function (xlow, ylow, zlow, xhigh, yhigh, zhigh)
  {
    this.box[0][0] = xlow;
    this.box[0][1] = ylow;
    this.box[0][2] = zlow;
    this.box[1][0] = xhigh;
    this.box[1][1] = yhigh;
    this.box[1][2] = zhigh;
  }


  // Checks whether the current ray hits the current box at any t between t0
  // and t1, but doesn't calculate where it hits. Returns a bool.
  RayBoxIntersector.prototype.shadowIntersect = function (t0, t1)
  {
    for (var i = 0; i < 3; i++)
      this.tMin[i] = (this.box[this.sign[i]][i] - this.raySrc[i]) * this.rayInvDir[i];
    for (var i = 0; i < 3; i++)
      this.tMax[i] = (this.box[1 - this.sign[i]][i] - this.raySrc[i]) * this.rayInvDir[i];

    var tMinVal = Math.max(this.tMin[0], Math.max(this.tMin[1], this.tMin[2]));
    var tMaxVal = Math.min(this.tMax[0], Math.min(this.tMax[1], this.tMax[2]));
    return tMinVal <= tMaxVal && tMinVal < t1 && tMaxVal > t0;
  }


  // Finds the lowest t value between t0 and t1 at which the ray hits the
  // current box. If the ray doesn't hit the box between those two values, we
  // return Number.POSITIVE_INFINITY instead.
  RayBoxIntersector.prototype.intersect = function (t0, t1)
  {
    for (var i = 0; i < 3; i++)
      this.tMin[i] = (this.box[this.sign[i]][i] - this.raySrc[i]) * this.rayInvDir[i];
    for (var i = 0; i < 3; i++)
      this.tMax[i] = (this.box[1 - this.sign[i]][i] - this.raySrc[i]) * this.rayInvDir[i];

    var tMinVal = Math.max(this.tMin[0], Math.max(this.tMin[1], this.tMin[2]));
    var tMaxVal = Math.min(this.tMax[0], Math.min(this.tMax[1], this.tMax[2]));
    if (tMinVal <= tMaxVal && tMinVal < t1 && tMaxVal > t0)
      return tMinVal;
    else
      return Number.POSITIVE_INFINITY;
  }



  //
  // Export public functions
  //

  return {
    'RayBoxIntersector': RayBoxIntersector
  };

}());

