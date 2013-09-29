// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

// Include time.js and state.js before this file.
ludum.require(
  'currentTime', 'updateCurrentTime', // from time.js
  'StateMachine'                      // from states.js
);

ludum.addSymbols(function(){

  //
  // Global variables
  //

  // The state machine for the game as a whole. This gets set to the value you
  // pass in to the startGame function. 
  var game = null;


  //
  // Functions
  //

  // Call this to start the main game loop. Make sure you've configured the
  // game state machine first though!
  function startGame(gameStateMachine)
  {
    if (game !== null)
      throw new Error('game has already been started');

    // Set the game context variables.
    game = gameStateMachine;
    ludum.updateCurrentTime();

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

    // Draw the current state.
    var stateObj = game.states[game.currentState];
    if (stateObj.draw)
      stateObj.draw(game);

    // Figure out how much time has passed since the last update.
    var prevT = ludum.currentTime();
    ludum.updateCurrentTime();
    var dt = ludum.currentTime() - prevT;

    // Update the game state machine. This may result in a single state
    // transition.
    game.update(dt);
  }


  //
  // Export public symbols
  //

  return {
    'startGame': startGame
  };

}());
