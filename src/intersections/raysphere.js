// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){

  //
  // RaySphereIntersector class
  //

  function RaySphereIntersector()
  {
    this.raySrc = [ 0.0, 0.0, 0.0 ];
    this.rayDir = [ 0.0, 0.0, -1.0 ];
    this.sphereCentre = [ 0.0, 0.0, 0.0 ];
    this.sphereRadius = 1.0;

    this.tmp = [ 0.0, 0.0, 0.0 ];
  }


  RaySphereIntersector.prototype = {}


  RaySphereIntersector.prototype.setRaySrc = function (x, y, z)
  {
    this.raySrc[0] = x;
    this.raySrc[1] = y;
    this.raySrc[2] = z;
  }


  RaySphereIntersector.prototype.setRayDir = function (x, y, z, normalize)
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
  }


  RaySphereIntersector.prototype.setSphere = function (x, y, z, radius)
  {
    this.sphereCentre[0] = x;
    this.sphereCentre[1] = y;
    this.sphereCentre[2] = z;
    this.sphereRadius = radius;
  }


  RaySphereIntersector.prototype.shadowIntersect = function (t0, t1)
  {
    this._sub(this.tmp, this.raySrc, this.sphereCentre);

    // Could optimise this by:
    // - moving the calculation of A into the setRayDir method.
    // - storing sphereRadius squared instead.
    // - calculating A = 2A and 1/2A up front.
    // - calculating B = -B

    var A = this._dot(this.rayDir, this.rayDir);
    var B = 2 * this._dot(this.tmp, this.rayDir);
    var C = this._dot(this.tmp, this.tmp) - this.sphereRadius * this.sphereRadius;

    var discriminant = B * B - 4 * A * C;
    if (discriminant < 0.0)
      return false;

    var discSqrt = Math.sqrt(discriminant);
    var ts = (-B - discSqrt) / (2 * A);
    var tp = (-B + discSqrt) / (2 * A);
    var tMin = Math.min(ts, tp);
    var tMax = Math.max(ts, tp);

    return tMin < t1 && tMax > t0;
  }


  RaySphereIntersector.prototype.intersect = function (t0, t1)
  {
    this._sub(this.tmp, this.raySrc, this.sphereCentre);

    // Could optimise this the same way as in the shadowIntersect method.

    var A = this._dot(this.rayDir, this.rayDir);
    var B = 2 * this._dot(this.tmp, this.rayDir);
    var C = this._dot(this.tmp, this.tmp) - this.sphereRadius * this.sphereRadius;

    var discriminant = B * B - 4 * A * C;
    if (discriminant < 0.0)
      return Number.POSITIVE_INFINITY;

    var discSqrt = Math.sqrt(discriminant);
    var ts = (-B - discSqrt) / (2 * A);
    var tp = (-B + discSqrt) / (2 * A);
    var tMin = Math.min(ts, tp);
    var tMax = Math.max(ts, tp);

    if (tMin < t1 && tMax > t0)
      return tMin;
    else
      return Number.POSITIVE_INFINITY;
  }


  RaySphereIntersector.prototype._dot = function (a, b)
  {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }


  RaySphereIntersector.prototype._sub = function (out, a, b)
  {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
  }


  //
  // Export public functions
  //

  return {
    'RaySphereIntersector': RaySphereIntersector
  };

}());

