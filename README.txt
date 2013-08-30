Ludum Engine
============

This is my attempt at creating a properly reusable JavaScript game library, from
the ashes of my previous Ludum Dare entries.


Features
========

- State machines (this is what started it all!).
- A specialised state machine for the main game loop, so you can define your
  game in terms of states like 'loading', 'main_menu', 'playing', etc.
- Input handling for mouse and keyboard.
- Asynchronous asset loading, with groups and post-processing, with support for
  text, images, audio and custom (user-defined) asset types.
- Browser capability detection (for a limited set of browser features).
- Geometric intersection tests.


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

Or just use the minified version of the whole library. It's only about 13 Kb
(at time of writing), or about 3.6 Kb if you gzip it.


Testing
=======

Open tests/index.html in a browser

If you have a local web server running from the project root, on port 8000
(for example), then you can navigate to http://localhost:8000/tests/index.html
instead.

Either way, just opening the page will automatically run all the tests.


Still to do
===========

There's lots! Here's what I'm thinking:
- More unit test coverage.
- Documentation
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
- HUDs, both as HTML overlays and as textures for WebGL.
