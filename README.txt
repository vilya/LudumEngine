Ludum Engine
============

This is my attempt at creating a properly reusable JavaScript game library, from
the ashes of my previous Ludum Dare entries.


Features
========

- An event-driven state machine, for the main game loop.
- Input handling for mouse and keyboard.
- Asynchronous asset loading, with groups and post-processing.
- Browser capability detection (for a limited set of browser features).
- Geometric intersection tests


Usage
=====

The basic flow is:
- Check the browser capabilities to make sure it has everything you're going
  to need.
- Set up input handlers by calling e.g. ludum.useKeyboard().
- Set up the different game states.
- Add transitions between the states.
- Create an asset loader & add assets to it.
- Start the main game loop by calling ludum.startGame().

If you're loading all your assets up front, then the initial state should be a
loading screen. It should have an 'enter' function which starts the asset
loader, and a 'draw' function which draws the loading screen. You can add a
condition event which checks whether the loader has finished and if so,
transitions into the main starting state.

Note that the library is modular now, so you can include just the parts you
need. All the parts depend on base.js though (it defines the ludum namespace),
so be sure to include that first.


Still to do
===========

There's lots! Here's what I'm thinking:
- Unit tests
- Documentation
- Build script to generate a single minified file from all the src files.
- Geometric data structures (quadtree, octree, BVH, kD-Tree).
- Scene graph.
- More intersection tests.
- Collision detection.
- Canvas-based 2D renderer.
- WebGL-based 3D renderer.
- Loaders for some common 2D and 3D file formats:
  - Collada
  - OBJ
  - SVG
- Audio mixing support.
- 2D and 3D positional audio.
