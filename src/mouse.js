// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){

  //
  // Constants
  //

  var buttons = {
    'LEFT': 0,
    'MIDDLE': 1,
    'RIGHT': 2
  };


  //
  // Global variables
  //

  var mouse = {
    'x': 0,                 // Last known mouse x location.
    'y': 0,                 // Last known mouse y location.
    'dx': 0,                // Change in x relative to the previous mouse location.
    'dy': 0,                // Change in y relative to the previous mouse location.
    'leftButton': false,    // Whether the left mouse button is currently pressed.
    'middleButton': false,  // Whether the middle mouse button is currently pressed.
    'rightButton': false,   // Whether the right mouse button is currently pressed.
    'pointerLocked': false  // Whether pointer lock is currently active.
  };


  //
  // Functions
  //

  // Install our mouse handlers. You must call this for all the other
  // mouse-related functions in this module to work.
  function useMouse()
  {
    document.onmousedown = _mouseDown;
    document.onmouseup = _mouseUp;
    document.onmousemove = _mouseMove;
  }


  function anyButtonPressed()
  {
    return mouse.leftButton || mouse.middleButton || mouse.rightButton;
  }


  function isButtonPressed(button)
  {
    switch (button) {
    case buttons.LEFT:
      return mouse.leftButton;
    case buttons.MIDDLE:
      return mouse.middleButton;
    case buttons.RIGHT:
      return mouse.rightButton;
    default:
      return false;
    }
  }


  //
  // Private functions
  //

  function _mouseDown(event)
  {
    var btn = event.button;
    switch (event.button) {
    case buttons.LEFT:
      mouse.leftButton = true;
      break;
    case buttons.MIDDLE:
      mouse.middleButton = true;
      break;
    case buttons.RIGHT:
      mouse.rightButton = true;
      break;
    default:
      break;
    }
    _updateMousePos(event);
  }


  function _mouseUp(event)
  {
    var btn = event.button;
    switch (event.button) {
    case buttons.LEFT:
      mouse.leftButton = false;
      break;
    case buttons.MIDDLE:
      mouse.middleButton = false;
      break;
    case buttons.RIGHT:
      mouse.rightButton = false;
      break;
    default:
      break;
    }
    _updateMousePos(event);
  }


  function _mouseMove(event)
  {
    _updateMousePos(event);
  }


  function _updateMousePos(event)
  {
    // clientX and clientY are the standard DOM properties for this.
    x = event.clientX;
    y = event.clientY;
  }


  //
  // Export public symbols
  //

  return {
    // Enums
    'buttons': buttons,
    // Global state
    'mouse': mouse,
    // Functions
    'useMouse': useMouse,
    'anyButtonPressed': anyButtonPressed,
    'isButtonPressed': isButtonPressed
  };

}());
