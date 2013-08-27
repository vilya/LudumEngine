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
    var scale = Math.pow(10, decimalPlaces);
    var rounded = Math.floor(value * scale) / scale;
    str = "" + rounded;
    if (decimalPlaces > 0 && rounded == Math.floor(rounded)) {
      str += ".";
      for (var i = 0; i < decimalPlaces; i++)
        str += 0;
    }
    return str;
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


  //
  // Export public symbols
  //

  return {
    'radians': radians,
    'degrees': degrees,
    'roundTo': roundTo,
    'clamp': clamp,
    'saturate': saturate
  };

}());
