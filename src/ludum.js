var ludum = function () {  // start of the ludum namespace

  //
  // Export public symbols.
  //

  return {
    // Constant bundles
    'keycodes': keycodes,
    'buttons': buttons,
    // Game variables
    'config': config,
    'globals': globals,
    'mouse': globals.mouse,
    // Standard event trigger and expire methods
    'alwaysTrigger': alwaysTrigger,
    'neverExpire': neverExpire,
    'timeTrigger': timeTrigger,
    'timeExpire': timeExpire,
    // Input handling
    'useKeyboard': useKeyboard,
    'clearKeyboard': clearKeyboard,
    'anyKeyPressed': anyKeyPressed,
    'isKeyPressed': isKeyPressed,
    'useMouse': useMouse,
    'anyButtonPressed': anyButtonPressed,
    'isButtonPressed': isButtonPressed,
    // Intersection testing classes
    'RayBoxIntersector': RayBoxIntersector,
    'RaySphereIntersector': RaySphereIntersector
  };

}(); // end of the ludum namespace.

