// Done: state-machine
// - Each state has enter, draw, update and leave functions.
// - Each state can have any number of pre-scripted events
// - Events have a trigger predicate and enter, draw, update, leave functions.
// - Set up default states: titles, level1, win, lose.
// - Can have the check for victory conditions as a trigger predicate for an event?

// Done: Input tracking
// - keyboard
// - mouse
// Can enable and disable input devices independently.

// Drawing library
// - Support for webgl, canvas.
// - Consistent api regardless of which back-end is being used.
// - Option to fallback gracefully from WebGL to Canvas.
// - Function to add a drawing area to the page, given a parent.
// - Text rendering

// Sound library
// - Support for loops (i.e. background music) and one-off sounds (e.g. sfx).
// - Function to add an audio tag to the page, given a parent.

// Sprites
// - Static or animated.
// - Sprite-to-sprite collision detection
// - Sprite-to-environment collision detection
// - Placeholder graphics for when textures haven't loaded yet

var ludum = function () {  // start of the ludum namespace

  //
  // Constants
  //

  var keycodes = {
    'ESCAPE': 27,
    'LEFT': 37,
    'RIGHT': 39.
    'UP': 38,
    'DOWN': 40,
  };

  var buttons = {
    'LEFT': 0,
    'MIDDLE': 1,
    'RIGHT': 2,
  };


  //
  // Variables
  //

  // Holds game configuration data - stuff that shouldn't change once set up.
  var config = {
    'states': {},
  };

  // Holds the current state of the game while running.
  var globals = {
    'lastT': 0,           // The current game time (in ms since datum).
    'lastStateT': 0,      // The time we last changed states at (in ms since datum).
    'stateT': 0,          // The amount of time we've been in the current state for, in seconds.
    'currentState': null, // The current game state. Set this to a valid state before starting the game.
    'prevState': null,    // The previous state we were in, useful for coming back from e.g. a pause screen.
    'activeEvents': [],   // The currently active events for the current state.
    'pendingEvents': [],  // The events still waiting to be activated for the current state.

    'keysDown': {},       // Map of which keys are currently held down.
    'mouse': {
      'x': 0,             // Last known mouse x location.
      'y': 0,             // Last known mouse y location.
      'buttonsDown': {},  // Map of which mouse buttons are currently held down.
    },
  };


  //
  // Setup and configuration
  //

  function addState(name, stateMethods)
  {
    var newState = _makeState(name, stateMethods);
    config.states[name] = newState;
  }


  function _makeState(name, stateMethods)
  {
    var newState = {
      'name': name,
      'enter': null,
      'draw': null,
      'update': null,
      'leave': null,
      'events': [],
    };

    if (stateMethods) {
      if (stateMethods.enter)
        newState.enter = stateMethods.enter;
      if (stateMethods.draw)
        newState.draw = stateMethods.draw;
      if (stateMethods.update)
        newState.update = stateMethods.update;
      if (stateMethods.leave)
        newState.leave = stateMethods.leave;
    }

    return newState;
  }


  function addEvent(stateName, trigger, expire, eventMethods)
  {
    var newEvent = _makeEvent(trigger, expire, eventMethods);
    config.states[stateName] = newEvent;
  }


  function addAlwaysOnEvent(stateName, eventMethods)
  {
    var newEvent = _makeEvent(alwaysTrigger, newEvent, eventMethods);
    config.states[stateName] = newEvent;
  }


  function addTimeEvent(stateName, t, duration, eventMethods)
  {
    var trigger = timeTrigger;
    var expire = null;
    if (duration > 0.0)
      expire = timeExpire;

    var newEvent = _makeEvent(trigger, expire, eventMethods);
    // Extra properties.
    newEvent.t = t;
    if (duration > 0.0)
      newEvent.duration = duration;

    config.states[stateName].push(newEvent);
  }


  function addKeyPressEvent(stateName, key, duration, eventMethods)
  {
    var trigger = keyTrigger;
    var expire = null;
    if (duration > 0.0)
      expire = timeExpire;

    var newEvent = _makeEvent(trigger, expire, eventMethods);
    // Extra properties.
    if (duration > 0.0) {
      newEvent.wrappedEnter = newEvent.enter;
      newEvent.enter = function () {
        this.t = game.lastT;
        if (this.wrappedEnter)
          this.wrappedEnter();
      }
      newEvent.duration = duration;
    }

    config.states[stateName].push(newEvent);
  }


  function addChangeStateOnKeyPressEvent(stateName, key, targetState, eventMethods)
  {
    var trigger = keyTrigger;
    var expire = null;

    var newEvent = _makeEvent(trigger, null, eventMethods);
    // Extra properties
    newEvent.wrappedEnter = newEvent.enter;
    newEvent.enter = function () {
      if (this.wrappedEnter)
        this.wrappedEnter();
      changeState(this.targetState);
    }
    newEvent.targetState = targetState;

    config.states[stateName].push(newEvent);
  }


  function addGameConditionEvent(stateName, victoryPred, targetState, eventMethods)
  {
    var newEvent = _makeEvent(victoryPred, null, eventMethods);
    // Extra properties
    newEvent.wrappedEnter = newEvent.enter;
    newEvent.enter = function () {
      if (this.wrappedEnter)
        this.wrappedEnter();
      changeState(this.targetState);
    }
    newEvent.targetState = targetState;

    config.states[stateName].push(newEvent);
  }


  function _makeEvent(trigger, expire, eventMethods)
  {
    var newEvent = {
      // Standard properties.
      'trigger': trigger,
      'expire': null,
      'enter': null,
      'leave': null,
      'update': null,
      'draw': null,
    };

    if (expire)
      newEvent.expire = expire;

    if (eventMethods) {
      if (eventMethods.enter)
        newEvent.enter = eventMethods.enter;
      if (eventMethods.leave)
        newEvent.leave = eventMethods.leave;
      if (eventMethods.update)
        newEvent.update = eventMethods.update;
      if (eventMethods.draw)
        newEvent.draw = eventMethods.draw;
    }

    return newEvent;
  }


  //
  // Standard event trigger and expire methods
  //

  function alwaysTrigger()
  {
    return true;
  }


  function neverExpire()
  {
    return false;
  }


  function timeTrigger()
  {
    return (globals.stateT >= this.t);
  }


  function timeExpire()
  {
    return globals.stateT >= (this.t + this.duration);
  }


  //
  // Main game logic.
  //

  function main()
  {
    window.requestAnimFrame = (function() {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
               window.setTimeout(callback, 1000/60);
             };
    })();
    _mainLoop();
  }


  function _mainLoop()
  {
    requestAnimFrame(_mainLoop);
    draw();
    update();
  }


  function _draw()
  {
    _drawState();
    _drawEvents();
  }


  function _drawState()
  {
    if (globals.currentState && globals.currentState.draw)
      globals.currentState.draw();
  }


  function _drawEvents()
  {
    for (var i = 0; i < globals.activeEvents.length; i++) {
      var ev = globals.activeEvents[i];
      if (ev.draw)
        ev.draw();
    }
  }


  function _update()
  {
    var dt = _updateGameTime();
    _updateState(dt);
    _expireEvents();
    _updateEvents(dt);
    _triggerEvents();
  }


  function _updateGameTime()
  {
    var t = Date.now();
    var dt = t - globals.lastT;
    globals.lastT = t;
    globals.stateT = (t - globals.lastStateT) / 1000.0;
    return dt;
  }


  function _updateState(dt)
  {
    if (globals.currentState && globals.currentState.update)
      globals.currentState.update(dt);
  }


  function _expireEvents()
  {
    var newEvents = [];
    for (var i = 0; i < globals.activeEvents.length; i++) {
      var ev = globals.activeEvents[i];
      if (!ev.expire()) {
        newEvents.push(ev);
        continue;
      }

      if (ev.leave)
        ev.leave();
    }
    globals.activeEvents = newEvents;
  }


  function _updateEvents(dt)
  {
    for (var i = 0; i < globals.activeEvents.length; i++) {
      var ev = globals.activeEvents[i];
      if (ev.update)
        ev.update(dt);
    }
  }


  function _triggerEvents()
  {
    var newEvents = [];
    for (var i = 0; i < globals.pendingEvents.length; i++) {
      var ev = globals.pendingEvents[i];
      if (!ev.trigger()) {
        newEvents.push(ev);
        continue;
      }

      if (ev.enter)
        ev.enter();

      if (ev.expire)
        globals.activeEvents.push(ev);
      else if (ev.leave)
        ev.leave();
    }
    globals.pendingEvents = newEvents;
  }


  function changeState(newStateName)
  {
    globals.lastT = Date.now();
    clearKeyboard();

    // Clear out the current event lists.
    globals.activeEvents = [];
    globals.pendingEvents = [];

    // Change the state.
    if (globals.currentState.leave)
      globals.currentState.leave();
    globals.prevState = globals.currentState;
    globals.currentState = config.states[newStateName];
    if (globals.currentState.enter())
      globals.currentState.enter();
  
    // Populate the pending event list from the new state.
    for (var i = 0; i < globals.currentState.events.length; i++)
      globals.pendingEvents.push(globals.currentState.events[i]);

    // Record the timestamp of the change.
    globals.lastStateT = globals.lastT;
    globals.stateT = 0.0;
  }


  function changeToPrevState()
  {
    changeState(globals.prevState.name);
  }


  //
  // Input handling
  //

  function useKeyboard()
  {
    document.onkeydown = _keyDown;
    document.onkeyup = _keyUp;
  }


  function clearKeyboard()
  {
    // Clear the keyboard state.
    for (key in game.keysDown)
      game.keysDown[key] = false;
  }
  
  
  function anyKeyPressed()
  {
    for (key in game.keysDown) {
      if (game.keysDown[key])
        return true;
    }
    return false;
  }


  function isKeyPressed(key)
  {
    return globals.keysDown[key];
  }
  
  
  function _keyDown(event)
  {
    game.keysDown[event.keyCode] = true;
    game.keysDown[String.fromCharCode(event.keyCode)] = true;
  }
  
  
  function _keyUp(event)
  {
    game.keysDown[event.keyCode] = false;
    game.keysDown[String.fromCharCode(event.keyCode)] = false;
  }


  function useMouse()
  {
    if (globals.canvas)
      globals.canvas.onmousedown = _mouseDown;
    else
      document.onmousedown = _mouseDown;
    document.onmouseup = _mouseUp;
    document.onmousemove = _mouseMove;
  }


  function anyButtonPressed()
  {
    for (btn in game.mouse.buttonsDown) {
      if (game.mouse.buttonsDown[btn])
        return true;
    }
    return false;
  }


  function isButtonPressed(btn)
  {
    return globals.mouse.buttonsDown[btn];
  }


  function _mouseDown(event)
  {
    var btn = event.button;
    globals.mouse.buttonsDown[btn] = true;
    globals.mouse.x = event.x;
    globals.mouse.y = event.y;
  }


  function _mouseUp(event)
  {
    var btn = event.button;
    globals.mouse.buttonsDown[btn] = false;
    globals.mouse.x = event.x;
    globals.mouse.y = event.y;
  }


  function _mouseMove(event)
  {
    globals.mouse.x = event.x;
    globals.mouse.y = event.y;
  }


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
    // Setup and configuration
    'addState': addState,
    'addEvent': addEvent,
    'addAlwaysOnEvent': addAlwaysOnEvent,
    'addTimeEvent': addTimeEvent,
    'addKeyPressEvent': addKeyPressEvent,
    'addChangeStateOnKeyPressEvent': addChangeStateOnKeyPressEvent,
    'addGameConditionEvent': addGameConditionEvent,
    // Standard event trigger and expire methods
    'alwaysTrigger': alwaysTrigger,
    'neverExpire': neverExpire,
    'timeTrigger': timeTrigger,
    'timeExpire': timeExpire,
    // Main game loop
    'main': main,
    'changeState': changeState,
    'changeToPrevState': changeToPrevState,
    // Input handling
    'clearKeyboard': clearKeyboard,
    'anyKeyPressed': anyKeyPressed,
    'isKeyPressed': isKeyPressed,
  };

}(); // end of the ludum namespace.


// --- The rest of the file below this point line is a copy of David Bau's excellent seedrandom.js library.

// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow 
 * @param {number=} startdenom
 */
(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  [],   // pool: entropy pool starts empty
  Math, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
);

