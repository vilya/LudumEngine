Ludum Engine
============

This is my attempt at creating a properly reusable JavaScript game library, from
the ashes of my previous Ludum Dare entries.


Features
========

- An event-driven state machine, for the main game loop.
- Input handling for mouse and keyboard.
- Asynchronous asset loading, with groups and post-processing.
- Simple audio controls
- Browser capability detection (for a limited set of browser features).


Usage
=====

See example/example.js.

The basic flow is:
- Check the browser capabilities to make sure it has everything you're going
  to need.
- Set up input handlers by calling e.g. ludum.useKeyboard().
- Set up the different game states.
- Add events to the states.
- Create an asset loader & add assets to it.
- Start the main loop by calling ludum.start('initialStateName').

If you're loading all your assets up front, then the initial state should be a
loading screen. It should have an 'enter' function which starts the asset
loader, and a 'draw' function which draws the loading screen. You can add a
condition event which checks whether the loader has finished and if so,
transitions into the main starting state.


Still to do
===========

There's lots! Here's what I'm thinking:
- WebGL-based renderer
- Collision detection
- Turn the state machine into a class, so you can have more than one of them
  (e.g. for NPC logic as well as game logic).
- Add audio loading support to the loader, so that you can track whether all
  the sounds you need have finished loading.
