// Include ludum.min.js before this file.
if (!ludum)
  throw Error("you must include ludum.min.js before this file");

var example2d = function () {

  //
  // Constants
  //

  var COLORS = {
    'background':         "#222222",
    'loadingBar':         "#990000",
    'loadingText':        "#997777",
    'menuSelectedText':   "#997777",
    'menuUnselectedText': "#990000",
    'countdown':          "#990000",
    'player':             "#AAAAAA",
  };

  var FONTS = {
    'loadingText':        "24px Alagard",
    'menuSelectedText':   "56px Alagard",
    'menuUnselectedText': "48px Alagard",
    'countdown':          "64px Alagard",
  };

  var MENU_ACTIONS = {
    'ignore':       0,
    'enterSubmenu': 1,
    'leaveSubmenu': 2,
    'playGame':     3,
    'restart':      4,
  };


  //
  // Global variables
  //

  var canvas; // The main game window element.
  var ctx;    // The drawing context for the game (a 2D context in this case).
  var loader; // The asset loader. This is configured and started when we enter the 'loading' state.

  var menu = new ludum.Menu(new ludum.MenuItem("root", MENU_ACTIONS.ignore,
    new ludum.MenuItem("Play game", MENU_ACTIONS.playGame),
    new ludum.MenuItem("Settings", MENU_ACTIONS.enterSubmenu,
      new ludum.MenuItem("Controls", MENU_ACTIONS.ignore),
      new ludum.MenuItem("Video", MENU_ACTIONS.ignore),
      new ludum.MenuItem("Audio", MENU_ACTIONS.ignore),
      new ludum.MenuItem("Back to main menu", MENU_ACTIONS.leaveSubmenu)
    ),
    new ludum.MenuItem("High scores", MENU_ACTIONS.ignore),
    new ludum.MenuItem("Credits", MENU_ACTIONS.ignore),
    new ludum.MenuItem("Restart", MENU_ACTIONS.restart)
  ));

  var defaultPlayer = new ludum.StateMachine('Player', {
    'x': 0,
    'y': 0,
    'w': 32,
    'h': 32,
    'speed': 256
  });
  var player = null;

  var level = {
    'x': -50,
    'y': -50,
    'w': 100,
    'h': 100
  };


  //
  // Loading state
  //

  var loadingFuncs = {
    // Create, configure and start the asset loader.
    'enter': function (game)
    {
      // Create the asset loader.
      //loader = new ludum.Loader();

      // Configure all the assets to be loaded.
      // TODO

      // Start loading.
      //loader.start();
    },


    // Draw the loading screen.
    'draw': function (game)
    {
      //var progress = loader.fractionComplete();
      var progress = game.userData.stateT / 3.0;

      clearScreen(COLORS.background);

      // Draw the loading bar outline.
      var w = canvas.width * 0.9;
      var h = 32;
      var x = (canvas.width - w) / 2.0;
      var y = (canvas.height - h) / 2.0;
      ctx.strokeStyle = COLORS.loadingBar;
      ctx.strokeRect(x, y, w, h);

      // Draw the loading bar progress rect.
      w *= progress;
      ctx.fillStyle = COLORS.loadingBar;
      ctx.fillRect(x, y, w, h);

      // Draw the loading text.
      var msg = ludum.roundTo(progress * 100.0, 0) + "%";
      ctx.font = FONTS.loadingText;
      w = ctx.measureText(msg).width;
      h = 24;
      x = (canvas.width - w) / 2.0;
      y = (canvas.height + h) / 2.0 - 4;
      ctx.fillStyle = COLORS.loadingText;
      ctx.fillText(msg, x, y);
    },


    // Check whether we've finished loading. If so, switch to the MENU state.
    'update': function (game, dt)
    {
      //var progress = loader.fractionComplete();
      var progress = game.userData.stateT / 3.0;
      if (progress >= 1.0)
        ludum.game.changeState(ludum.game.MENU);
    },


    'leave': function (game)
    {
      // Post-process any assets that still need it.
      // TODO
    },
  };


  //
  // Menu state
  //

  var menuFuncs = {
    // Reset the menu to the default state.
    'enter': function (game)
    {
      menu.reset();
    },


    // Draw the menu.
    'draw': function (game)
    {
      clearScreen(COLORS.background);
      drawMenu(menu);
    },


    // Handle keystrokes and mouse clicks.
    'update': function (game, dt)
    {
      // Space or Enter accepts the currently selected menu option.
      if (ludum.isKeyPressed(ludum.keycodes.ENTER) || ludum.isKeyPressed(ludum.keycodes.SPACE)) {
        var action = menu.selectedItem().action;
        switch (action) {
        case MENU_ACTIONS.enterSubmenu:
          menu.enterSubmenu();
          break;
        case MENU_ACTIONS.leaveSubmenu:
          menu.leaveSubmenu();
          break;
        case MENU_ACTIONS.playGame:
          ludum.game.changeState(ludum.game.STARTING_GAME);
          break;
        case MENU_ACTIONS.restart:
          ludum.game.changeState(ludum.game.LOADING);
          break;
        default:
          break;
        }

        ludum.clearKeyboard();
        return;
      }

      // Escape takes you back up one level in the menu.
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        menu.leaveSubmenu();
        ludum.clearKeyboard();
        return;
      }

      // If the player is pressing Up or Down, change the selected menu option.
      if (ludum.isKeyPressed(ludum.keycodes.UP)) {
        menu.moveSelectedIndex(-1);
        ludum.clearKeyboard();
      }
      else if (ludum.isKeyPressed(ludum.keycodes.DOWN)) {
        menu.moveSelectedIndex(+1);
        ludum.clearKeyboard();
      }
    },
  };


  //
  // Starting Game state
  //

  var startingGameFuncs = {
    'draw': function (game)
    {
      clearScreen(COLORS.background);

      var msg = ludum.roundTo(Math.ceil(3.0 - ludum.game.userData.stateT), 0);

      ctx.font = FONTS.countdown;
      ctx.fillStyle = COLORS.countdown;

      // Draw the countdown.
      var w = ctx.measureText(msg).width;
      var h = 64;
      var x = (canvas.width - w) / 2.0;
      var y = (canvas.height - h) / 2.0;
      ctx.fillText(msg, x, y);
    },


    'update': function (game, dt)
    {
      var t = game.userData.stateT;
      if (t >= 3.0) {
        game.changeState(game.PLAYING);
        return;
      }

      // If the player is pressing escape, take them back to the main menu.
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        ludum.clearKeyboard();
        game.changeState(game.MENU);
      }
    }
  };


  //
  // Playing state
  //

  var playingFuncs = {
    'enter': function (game)
    {
      player = defaultPlayer.newInstance();
      player.start();
    },


    'draw': function (game)
    {
      clearScreen(COLORS.background);
      drawLevel();
      drawPlayer(player.userData);
    },


    'update': function (game, dt)
    {
      // If the player is pressing escape, take them back to the main menu.
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        ludum.clearKeyboard();
        game.changeState(game.MENU);
        return;
      }

      // Update the player
      player.update(dt);
    },
  };


  //
  // Player states
  //

  var playerDefaultStateFuncs = {
    'update': function (player, dt)
    {
      // Move player.
      var dx = 0.0, dy = 0.0;
      if (ludum.isAnyOfSeveralKeysPressed(ludum.keycodes.LEFT, "A", "a"))
        dx -= 1.0;
      if (ludum.isAnyOfSeveralKeysPressed(ludum.keycodes.RIGHT, "D", "d"))
        dx += 1.0;
      if (ludum.isAnyOfSeveralKeysPressed(ludum.keycodes.UP, "W", "w"))
        dy -= 1.0;
      if (ludum.isAnyOfSeveralKeysPressed(ludum.keycodes.DOWN, "S", "s"))
        dy += 1.0;

      if (dx !== 0.0 || dy !== 0.0) {
        var scaledSpeed = Math.sqrt(dx * dx + dy * dy) * dt * player.userData.speed;
        var mx = dx * scaledSpeed;
        var my = dy * scaledSpeed;
        player.userData.x = ludum.clamp(player.userData.x + mx, level.x, level.x + level.w);
        player.userData.y = ludum.clamp(player.userData.y + my, level.y, level.y + level.h);
      }
    }
  };


  //
  // Drawing functions
  //

  function clearScreen(bgColor)
  {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }


  function drawMenu()
  {
    ctx.font = FONTS.menuUnselectedText;

    var entries = menu.selectedMenu().children;
    var numEntries = entries.length;
    var selectedIndex = menu.selectedIndex();

    var w = 0;
    var h = 48;
    var lineSpacing = 16;
    for (var i = 0; i < numEntries; ++i)
      w = Math.max(w, ctx.measureText(entries[i].label).width);
    var totalHeight = h * numEntries + lineSpacing * (numEntries - 1);
    var x = (canvas.width - w) / 2.0;
    var y = (canvas.height - totalHeight + h) / 2.0;

    ctx.font = FONTS.menuUnselectedText;
    ctx.fillStyle = COLORS.menuUnselectedText;
    for (var i = 0; i < selectedIndex; ++i) {
      ctx.fillText(entries[i].label, x, y);
      y += h + lineSpacing;
    }
    
    ctx.font = FONTS.menuSelectedText;
    ctx.fillStyle = COLORS.menuSelectedText;
    ctx.fillText(entries[selectedIndex].label, x, y);
    y += h + lineSpacing;

    ctx.font = FONTS.menuUnselectedText;
    ctx.fillStyle = COLORS.menuUnselectedText;
    for (var i = selectedIndex + 1; i < numEntries; ++i) {
      ctx.fillText(entries[i].label, x, y);
      y += h + lineSpacing;
    }
  }


  function drawLevel()
  {
  }


  function drawPlayer(playerData)
  {
    var lowX = canvas.width * 0.25;
    var lowY = canvas.height * 0.25;
    var highX = canvas.width - lowX;
    var highY = canvas.height - lowY;

    var x = ludum.clamp((canvas.width - playerData.w) / 2.0 + playerData.x, lowX, highX);
    var y = ludum.clamp((canvas.height - playerData.h) / 2.0 + playerData.y, lowY, highY);

    ctx.fillStyle = COLORS.player;
    ctx.fillRect(x, y, playerData.w, playerData.h);
  }


  //
  // Main functions
  //

  function initRenderer()
  {
    var caps = ludum.browserInfo();
    if (!caps.canvas) {
      ludum.showMessage("<strong>Your browser doesn't appear to support the &lt;canvas&gt; tag.</strong> Unable to continue. Sorry!");
      return false;
    }

    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.body.appendChild(canvas);
    window.addEventListener('resize', setSize, false);

    ctx = canvas.getContext('2d');

    return true;
  }


  function initGame()
  {
    ludum.useKeyboard();
    ludum.useMouse();

    ludum.game.addState('LOADING', loadingFuncs);
    ludum.game.addState('MENU', menuFuncs);
    ludum.game.addState('STARTING_GAME', startingGameFuncs);
    ludum.game.addState('PLAYING', playingFuncs);
    //ludum.game.addState('PAUSED', pausedFuncs);
    //ludum.game.addState('WIN', winFuncs);
    //ludum.game.addState('LOSE', loseFuncs);
    //ludum.game.addState('HIGHSCORES', highScoresFuncs);
    //ludum.game.addState('CREDITS', creditsFuncs);

    //ludum.game.setInitialState(ludum.game.STARTING_GAME); // For debugging

    defaultPlayer.addState('DEFAULT', playerDefaultStateFuncs);

    return true;
  }


  function main()
  {
    if (!initRenderer())
      return;
    if (!initGame())
      return;

    ludum.startGame();
  }


  function setSize(w, h)
  {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }


  //
  // Export public functions
  //

  return {
    'main': main
  };

}();
