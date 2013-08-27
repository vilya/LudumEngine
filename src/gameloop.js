// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

// Include statemachine.js before this file.
ludum.require('StateMachine');

ludum.addSymbols(function(){

  //
  // Global variables
  //

  var game = new ludum.StateMachine({
    'gameT': 0.0,   // Current global time, in seconds since the start of the epoch (NOT milliseconds).
    'stateT': 0.0,  // Time we've been in the current state for, in seconds.
    'enterT': 0.0,  // Time at which we entered the current state (a saved copy of gameT from then).
  });

  var gameCtx = null;


  //
  // Functions
  //

  function addGameState(name, stateTemplate)
  {
    game.addState(name, stateTemplate);
  }


  function addGameTransition(fromState, toState, condition)
  {
    game.addTransition(fromState, toState, condition);
  }


  function addAutomaticGameTransition(fromState, toState)
  {
    game.addAutomaticTransition(fromState, toState);
  }


  function startGame()
  {
    // Create the context for the game state machine.
    gameCtx = game.newContext();

    // Set the game context variables.
    gameCtx.gameT = Date.now() / 1000.0;
    gameCtx.stateT = 0.0;
    gameCtx.enterT = gameCtx.gameT;

    // Start the game state machine.
    gameCtx.update(0);

    // Launch into the main loop.
    _mainLoop();
  }


  //
  // Private functions
  //

  function _mainLoop()
  {
    requestAnimFrame(_mainLoop);

    var stateObj = game.states[gameCtx.currentState];
    if (stateObj.draw)
      stateObj.draw(gameCtx);

    var t = Date.now() / 1000.0;
    var dt = t - gameCtx.gameT;
    gameCtx.gameT = t;
    gameCtx.stateT = t - gameCtx.enterT;

    var oldState = gameCtx.currentState;
    gameCtx.update(dt);
    var newState = gameCtx.currentState;
    if (newState != oldState)
      gameCtx.enterT = t;
  }


  //
  // Export public symbols
  //

  return {
    'game': game,
    'addGameState': addGameState,
    'addGameTransition': addGameTransition,
    'addAutomaticGameTransition': addAutomaticGameTransition,
    'startGame': startGame,
  };

}());
