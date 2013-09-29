// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){
  
  //
  // Variables
  //

  // The value that we report as the current time, from the game's point of
  // view. This is a time in seconds stored as a floating point value, where the
  // fractional part is smaller durations (e.g. milliseconds, etc). It's
  // adjusted to account for pauses.
  var gameTime = 0.0;

  // The current time, in seconds since the start of the epoch (NOT
  // milliseconds). This is a saved copy of the wall-clock time from when
  // updateCurrentTime() was last called.
  var wallClockTime = 0.0;

  // The total amount of time, in seconds, that the game has been paused for.
  var pausedTime = 0.0;

  // The wall clock time at which the game was paused. If the game is not
  // paused this will be set to null; otherwise, it'll be a copy of the
  // wallClockTime value from when the current pause began.
  var pausedAt = null;


  //
  // Time functions
  //

  // Save the current time. This should be called once per frame. This will
  // not update the current time if the game is paused.
  function updateCurrentTime()
  {
    wallClockTime = Date.now() / 1000.0;
    if (pausedAt === null)
      gameTime = wallClockTime - pausedTime;
  }


  // Get the current time, from the game's point of view, in seconds since the
  // start of the epoch. This is a floating point value with the fractional
  // part representing fractions of a second.
  function currentTime()
  {
    return gameTime;
  }


  // Prevent the game time from advancing. Call unpause() to resume. If we're
  // already paused when you call this, the function has no effect.
  function pause()
  {
    if (pausedAt !== null)
      return;
    pausedAt = wallClockTime;
  }


  // Resume advancing the game time after being paused. Use this after a call
  // to pause(). This will calculate the amount of time we were paused for and
  // add that to the total paused time, so that the next call to
  // updateCurrentTime() will update gameTime correctly.
  function unpause()
  {
    if (pausedAt === null)
      return;
    var pauseLength = wallClockTime - pausedAt;
    pausedTime += pauseLength;
    pausedAt = null;
  }


  //
  // Exports
  //

  return {
    'updateCurrentTime': updateCurrentTime,
    'currentTime': currentTime,
    'pause': pause,
    'unpause': unpause
  };

}());
