// Include ludum.min.js before this file.
if (!ludum)
  throw Error("you must include ludum.js or ludum.min.js before this file");

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
    'pausedText':         "#990000",
    'countdown':          "#990000",
    'player':             "#AAAAAA",
    'grid':               "#333333",
  };

  var FONTS = {
    'loadingText':        "24px Alagard",
    'menuSelectedText':   "56px Alagard",
    'menuUnselectedText': "48px Alagard",
    'pausedText':         "48px Alagard",
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
    'x': 0,         // In pixels
    'y': 0,         // In pixels
    'w': 32,        // In pixels
    'h': 32,        // In pixels
    'speed': 256,   // In pixels/second
  });
  var player = null;

  var defaultEnemy = new ludum.StateMachine('Enemy', {
    'x': 0,         // In pixels
    'y': 0,         // In pixels
    'w': 32,        // In pixels
    'h': 32,        // In pixels
    'speed': 256,   // In pixels/second
  });
  var enemies = [];
  var totalSpawned = 0;

  var level = {
    'x': -1600,     // In pixels
    'y': -1600,     // In pixels
    'w': 3200,      // In pixels
    'h': 3200,      // In pixels
    'tileSize': 32, // In pixels
  };

  var view = {
    'x': 0,         // Screen horizontal offset in pixels
    'y': 0,         // Screen vertical offset in pixels.
  };

  var game = new ludum.StateMachine('Game');


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
      var progress = game.stateT / 3.0;

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
      var progress = game.stateT / 3.0;
      if (progress >= 1.0)
        game.changeState(game.MENU);
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
          game.changeState(game.STARTING_GAME);
          break;
        case MENU_ACTIONS.restart:
          game.changeState(game.LOADING);
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
    'enter': function (game)
    {
      // Reset the view position.
      view.x = -canvas.width / 2.0;
      view.y = -canvas.height / 2.0;

      // Reset the player.
      player = defaultPlayer.newInstance();
      player.start();

      // Clear out all the old enemies.
      enemies = [];

      // Spawn a single new enemy, for testing.
      spawnEnemy(100, 100);
    },


    'draw': function (game)
    {
      clearScreen(COLORS.background);

      var msg = ludum.roundTo(Math.ceil(3.0 - game.stateT), 0);

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
      if (game.stateT >= 3.0) {
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
    'draw': function (game)
    {
      clearScreen(COLORS.background);
      drawLevel();

      // Draw the player.
      drawPlayer(player.userData);

      // Draw the enemies.
      for (var i = 0, end = enemies.length; i < end; ++i)
        drawPlayer(enemies[i].userData);
    },


    'update': function (game, dt)
    {
      // If the player is pressing escape, take them back to the main menu.
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        ludum.clearKeyboard();
        game.changeState(game.MENU);
        return;
      }
      else if (ludum.isKeyPressed(ludum.keycodes.SPACE)) {
        ludum.clearKeyboard();
        game.changeState(game.PAUSED);
        return;
      }

      // Update the player
      player.update(dt);

      // Cull any dead enemies.
      // TODO

      // Update existing enemies
      for (var i = 0, end = enemies.length; i < end; ++i)
        enemies[i].update(dt);

      // Spawn any new enemies.
      // TODO
    },
  };


  //
  // Paused state
  //

  var pausedFuncs = {
    'enter': function (game)
    {
      ludum.pause();
    },


    'draw': function (game)
    {
      playingFuncs.draw(game);

      var msg = "Paused";

      ctx.font = FONTS.pausedText;
      ctx.fillStyle = COLORS.pausedText;

      // Draw the countdown.
      var w = ctx.measureText(msg).width;
      var h = 48;
      var x = (canvas.width - w) / 2.0;
      var y = (canvas.height - h) / 2.0;
      ctx.fillText(msg, x, y);
    },


    'update': function (game, dt)
    {
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        ludum.clearKeyboard();
        game.changeState(game.MENU);
      }
      else if (ludum.isKeyPressed(ludum.keycodes.SPACE)) {
        ludum.clearKeyboard();
        game.changeState(game.PLAYING);
      }
    },


    'leave': function (game)
    {
      ludum.unpause();
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
        var length = Math.sqrt(dx * dx + dy * dy);
        var mx = dx / length * dt * player.userData.speed;
        var my = dy / length * dt * player.userData.speed;
        player.userData.x = ludum.clamp(player.userData.x + mx, level.x, level.x + level.w);
        player.userData.y = ludum.clamp(player.userData.y + my, level.y, level.y + level.h);

        // Calculate the inner bounding region of the viewport.
        var ix = view.x + canvas.width * 0.25;
        var iy = view.y + canvas.height * 0.25;
        var iw = canvas.width * 0.5;
        var ih = canvas.height * 0.5;

        // If the new player position is outside the inner bounding region,
        // move the viewport so that they remain on the edge of it.
        var dx = player.userData.x - ix;
        var dy = player.userData.y - iy;

        if (dx < 0)
          view.x += dx;
        else if (dx > iw)
          view.x += (dx - iw);

        if (dy < 0)
          view.y += dy;
        else if (dy > ih)
          view.y += (dy - ih);

        view.x = ludum.clamp(view.x, level.x, level.x + level.w - canvas.width);
        view.y = ludum.clamp(view.y, level.y, level.y + level.h - canvas.height);
      }
    }
  };


  //
  // Enemy states
  //

  var enemyIdleStateFuncs = {
  };


  var enemyAttackingStateFuncs = {
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
    ctx.strokeStyle = COLORS.grid;
    var endX = level.x + level.w - view.x;
    var endY = level.y + level.h - view.y;
    for (var y = level.y - view.y; y < endY; y += level.tileSize * 2) {
      for (var x = level.x - view.x; x < endX; x += level.tileSize * 2) {
        ctx.strokeRect(x, y, level.tileSize, level.tileSize);
      }
    }
  }


  function drawPlayer(playerData)
  {
    var x = playerData.x - view.x - playerData.w / 2.0;
    var y = playerData.y - view.y - playerData.h / 2.0;

    x = ludum.clamp(x, 0, canvas.width);
    y = ludum.clamp(y, 0, canvas.height);

    ctx.fillStyle = COLORS.player;
    ctx.fillRect(x, y, playerData.w, playerData.h);

    ctx.fillStyle = COLORS.loadingText;
    ctx.font = FONTS.loadingText;
    var msg = "x, y = " + ludum.roundTo(playerData.x, 0) + ", " + ludum.roundTo(playerData.y, 0);
    ctx.fillText(msg, 32, 32);
    msg = "vx, vy = " + ludum.roundTo(view.x, 0) + ", " + ludum.roundTo(view.y, 0);
    ctx.fillText(msg, 32, 64);
  }


  //
  // Game logic
  //

  function spawnEnemy(sx, sy)
  {
    // Create the new enemy.
    var enemy = defaultEnemy.newInstance();
    enemy.name += (" #" + totalSpawned);

    // Decide where to spawn.
    // TODO: make sure we don't spawn on the player, inside a wall or anything like that.
    // TODO: pick somewhere not visible to the player
    var x = sx;
    var y = sy;
    if (x === undefined)
      x = level.x + level.tileSize / 2 + Math.floor(Math.random() * level.w / level.tileSize) * level.tileSize;
    if (y === undefined)
      y = level.y + level.tileSize / 2 + Math.floor(Math.random() * level.h / level.tileSize) * level.tileSize;
    enemy.userData.x = x;
    enemy.userData.y = y;

    ++totalSpawned;
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

    game.logging = true;
    game.addState('LOADING', loadingFuncs);
    game.addState('MENU', menuFuncs);
    game.addState('STARTING_GAME', startingGameFuncs);
    game.addState('PLAYING', playingFuncs);
    game.addState('PAUSED', pausedFuncs);
    //game.addState('WIN', winFuncs);
    //game.addState('LOSE', loseFuncs);
    //game.addState('HIGHSCORES', highScoresFuncs);
    //game.addState('CREDITS', creditsFuncs);

    //game.setInitialState(game.STARTING_GAME); // For debugging

    defaultPlayer.logging = true;
    defaultPlayer.addState('DEFAULT', playerDefaultStateFuncs);

    defaultEnemy.logging = true;
    defaultEnemy.addState('IDLE', enemyIdleStateFuncs);
    defaultEnemy.addState('ATTACKING', enemyAttackingStateFuncs);

    return true;
  }


  function main()
  {
    if (!initRenderer())
      return;
    if (!initGame())
      return;

    ludum.startGame(game);
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
