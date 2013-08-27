// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){

  //
  // Constants
  //

  var keycodes = {
    'ESCAPE': 27,
    'LEFT': 37,
    'RIGHT': 39,
    'UP': 38,
    'DOWN': 40,
  };


  //
  // Global variables
  //

  // This holds keys indexed both by keycode and the corresponding key string.
  var keysDown = {};


  //
  // Functions
  //

  // Install our keyboard handlers. You must call this for all the other
  // keyboard-related functions in this module to work.
  function useKeyboard()
  {
    document.onkeydown = _keyDown;
    document.onkeyup = _keyUp;
  }


  function clearKeyboard()
  {
    for (k in keysDown)
      keysDown[k] = false;
  }


  function anyKeyPressed()
  {
    for (k in keysDown) {
      if (keysDown[k])
        return true;
    }
    return false;
  }


  function isKeyPressed(key)
  {
    return keysDown[key];
  }


  //
  // Private functions
  //

  function _keyDown(event)
  {
    globals.keysDown[event.keyCode] = true;
    globals.keysDown[String.fromCharCode(event.keyCode)] = true;
  }
  
  
  function _keyUp(event)
  {
    globals.keysDown[event.keyCode] = false;
    globals.keysDown[String.fromCharCode(event.keyCode)] = false;
  }


  //
  // Export public symbols
  //

  return {
    // Enums
    'keycodes': keycodes,
    // Functions
    'useKeyboard': useKeyboard,
    'clearKeyboard': clearKeyboard,
    'anyKeyPressed': anyKeyPressed,
    'isKeyPressed': isKeyPressed
  };

}());
