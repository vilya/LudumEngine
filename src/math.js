// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){

  //
  // Constants
  //

  var DEGREES_TO_RADIANS = Math.PI / 180.0;
  var RADIANS_TO_DEGREES = 180.0 / Math.PI;


  //
  // Functions
  //

  function radians(angleInDegrees)
  {
    return angleInDegrees * DEGREES_TO_RADIANS;
  }


  function degrees(angleInRadians)
  {
    return angleInRadians * RADIANS_TO_DEGREES;
  }


  function roundTo(value, decimalPlaces)
  {
    return value.toFixed(decimalPlaces);
  }


  function clamp(value, min, max)
  {
    if (value <= min)
      return min;
    else if (value >= max)
      return max;
    else
      return value;
  }


  function saturate(value)
  {
    return clamp(value, 0.0, 1.0);
  }


  // Similar to the '%' operator, but with different behaviour for negative
  // numbers: negative numbers wrap around to the end of the range with this
  // function, whereas the % operator effectively returns -((-x) % y) when x is
  // negative. For positive numbers, the behaviour is the same as '%'.
  //
  // Note that, just like the '%' operator in javascript, we always use the
  // absolute value of 'y'.
  function wrap(x, y)
  {
    var result = x % y;
    if (result < 0)
      result += Math.abs(y);
    return result;
  }


  //
  // Export public symbols
  //

  return {
    'radians': radians,
    'degrees': degrees,
    'roundTo': roundTo,
    'clamp': clamp,
    'saturate': saturate,
    'wrap': wrap
  };

}());
