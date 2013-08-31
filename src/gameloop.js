// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

// Include statemachine.js before this file.
ludum.require('StateMachine');

ludum.addSymbols(function(){

  //
  // Global variables
  //

  // The state machine which runs the game as a whole. Add all the necessary
  // states to this then call the startGame() function to launch into the main
  // game loop. The game loop will automatically call game.update(dt) on each
  // iteration (with a correct value for dt).
  var game = new ludum.StateMachine("Game", {
    'gameT': 0.0,   // Current global time, in seconds since the start of the epoch (NOT milliseconds).
    'stateT': 0.0,  // Time we've been in the current state for, in seconds.
    'enterT': 0.0   // Time at which we entered the current state (a saved copy of gameT from then).
  });


  //
  // Functions
  //

  // Call this to start the main game loop. Make sure you've configured the
  // game state machine first though!
  function startGame()
  {
    // Set the game context variables.
    game.userData.gameT = Date.now() / 1000.0;
    game.userData.stateT = 0.0;
    game.userData.enterT = game.userData.gameT;

    // Start the game state machine.
    game.start();

    // Launch into the main loop.
    _mainLoop();
  }


  //
  // Private functions
  //

  function _mainLoop()
  {
    requestAnimFrame(_mainLoop);

    var stateObj = game.states[game.currentState];
    if (stateObj.draw)
      stateObj.draw();

    var t = Date.now() / 1000.0;
    var dt = t - game.userData.gameT;
    game.userData.gameT = t;
    game.userData.stateT = t - game.userData.enterT;

    var oldState = game.currentState;
    game.update(dt);
    var newState = game.currentState;
    if (newState != oldState)
      game.userData.enterT = t;
  }


  //
  // Export public symbols
  //

  return {
    'game': game,
    'startGame': startGame
  };

}());
