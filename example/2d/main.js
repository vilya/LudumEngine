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
    'gameOver':           "#990000",
    'player':             "#AAAAAA",
    'enemy':              "#990000",
    'grid':               "#333333",
  };

  var FONTS = {
    'loadingText':        "24px Alagard",
    'menuSelectedText':   "56px Alagard",
    'menuUnselectedText': "48px Alagard",
    'pausedText':         "48px Alagard",
    'countdown':          "64px Alagard",
    'gameOver':           "64px Alagard",
  };

  var MENU_ACTIONS = {
    'ignore':       0,
    'enterSubmenu': 1,
    'leaveSubmenu': 2,
    'playGame':     3,
  };

  var IMAGES = {
    'floor': null,
  };

  var MAX_VISIBLE_DISTANCE_SQR = 512.0 * 512.0; // Distance in pixels, squared


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
    new ludum.MenuItem("Credits", MENU_ACTIONS.ignore)
  ));

  var defaultPlayer = new ludum.StateMachine('Player', {
    'x': 0,                   // In pixels
    'y': 0,                   // In pixels
    'w': 32,                  // In pixels
    'h': 32,                  // In pixels
    'speed': 256,             // In pixels/second
    'attackRange': 32,        // How far away, in pixels, the players attack can reach.
    'attackDuration': 0.5,    // How long an attack lasts for, in seconds.
    'damage': 1,              // Amount of damage caused by this attack if it connects.
    'health': 3,              // Number of hits the player can take before dying.
    'deathDuration': 0.5,     // How long the death animation takes, in seconds.
    'dead': false,            // Whether the player is dead or not.
  });
  var player = null;

  var defaultEnemy = new ludum.StateMachine('Enemy', {
    'x': 0,                   // In pixels
    'y': 0,                   // In pixels
    'w': 32,                  // In pixels
    'h': 32,                  // In pixels
    'speed': 192,             // In pixels/second
    'attackRange': 32,        // How far away, in pixels, the enemys attack can reach.
    'attackDuration': 0.5,    // How long an attack lasts for, in seconds.
    'attackDelivered': false, // Whether the damage for an attack has been delivered yet.
    'damage': 1,              // Amount of damage caused by this attack if it connects.
    'health': 1,              // Number of hits this enemy can take before dying.
    'deathDuration': 0.5,     // How long the death animation takes for this enemy, in seconds.
    'dead': false,            // Whether this enemy is dead or not.
  });
  var enemies = [];
  var totalSpawned = 0;

  var level = null;
  /*
  {
    'x': -1600,           // In pixels
    'y': -1600,           // In pixels
    'w': 3200,            // In pixels
    'h': 3200,            // In pixels
    'tileSize': 32,       // In pixels
    'initialEnemies': 10, // # of enemies to spawn before starting this level.
  };
  */

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
      loader = new ludum.Loader();

      // Configure all the assets to be loaded.
      /*
      loader.addImage("img/floor_tile_32x32.png", null, function (img) {
        IMAGES.floor = img;
        return img;
      });
      */

      loader.addJSON("maps/helloworld.json", null, function (map) {
        level = map;
        level.x = 0;
        level.y = 0;
        level.w = map.tilewidth * map.width;
        level.h = map.tileheight * map.height;
        for (var i = 0, end = map.tilesets.length; i < end; ++i) {
          var tileset = map.tilesets[i];
          tileset.url = "maps/" + tileset.image;
          tileset.image = null;
          loader.addImage(tileset.url);
        }
        return map;
      });

      // Start loading.
      loader.start();
    },


    // Draw the loading screen.
    'draw': function (game)
    {
      var progress = loader.fractionComplete();
      //var progress = game.stateT / 3.0;

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
      var progress = loader.fractionComplete();
      //var progress = game.stateT / 3.0;
      if (progress >= 1.0)
        game.changeState(game.MENU);
    },


    'leave': function (game)
    {
      // Post-process the assets.
      level.tilesetByTileID = [null];
      for (var i = 0, end = level.tilesets.length; i < end; ++i) {
        var tileset = level.tilesets[i];
        tileset.image = loader.assets[tileset.url].value;
        var numTiles = (tileset.imagewidth * tileset.imageheight) / (tileset.tilewidth * tileset.tileheight);
        for (var j = 0, endJ = numTiles; j < endJ; ++j)
          level.tilesetByTileID.push(tileset);
      }

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
      // Reset the player.
      player = defaultPlayer.newInstance();
      player.start();

      // Put the player at the start point for this level.
      for (var i = 0, endI = level.layers.length; i < endI; ++i) {
        var layer = level.layers[i];
        if (layer.type == "objectgroup" && layer.name == "Locations") {
          for (var j = 0, endJ = layer.objects.length; j < endJ; ++j) {
            var obj = layer.objects[j];
            if (obj.name == "playerSpawnPoint") {
              player.userData.x = obj.x;
              player.userData.y = obj.y;
              break;
            }
          }
          break;
        }
      }

      // Make sure the player is inside the view.
      view.x = ludum.clamp(player.userData.x - canvas.width / 2.0, 0, level.w - canvas.width);
      view.y = ludum.clamp(player.userData.y - canvas.height / 2.0, 0, level.h - canvas.height);

      // Clear out all the old enemies.
      enemies = [];
      totalSpawned = 0;

      // Spawn some initial enemies.
      for (var i = 0, end = level.properties.initialEnemies; i < end; ++i)
        spawnEnemy();
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
        drawEnemy(enemies[i].userData);
    },


    'update': function (game, dt)
    {
      // If the player is pressing escape, take them back to the main menu.
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        ludum.clearKeyboard();
        game.changeState(game.PAUSED);
        return;
      }

      // Update the player
      player.update(dt);

      // If the player is dead, it's game over. Game over, man! Game over!
      if (player.userData.dead) {
        game.changeState(game.GAME_OVER);
        return;
      }

      // Cull any dead enemies.
      var numDead = 0;
      for (var i = 0, end = enemies.length; i < end; i++) {
        if (enemies[i].userData.dead)
          ++numDead;
      }
      if (numDead > 0) {
        var liveEnemies = [];
        for (var i = enemies.length - 1; i >= 0; --i) {
          if (!enemies[i].userData.dead)
            liveEnemies.push(enemies[i]);
        }
        enemies = liveEnemies;
      }

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
  // Game Over state
  //

  var gameOverFuncs = {
    'enter': function (game)
    {
      ludum.clearKeyboard();
    },


    'draw': function (game)
    {
      clearScreen(COLORS.background);

      var msg = "Game Over";

      ctx.font = FONTS.gameOver;
      ctx.fillStyle = COLORS.gameOver;

      // Draw the countdown.
      var w = ctx.measureText(msg).width;
      var h = 64;
      var x = (canvas.width - w) / 2.0;
      var y = (canvas.height - h) / 2.0;
      ctx.fillText(msg, x, y);
    },


    'update': function (game, dt)
    {
      if (game.stateT >= 5.0 || ludum.isAnyOfSeveralKeysPressed(ludum.keycodes.ESCAPE, ludum.keycodes.SPACE)) {
        ludum.clearKeyboard();
        game.changeState(game.MENU);
      }
    }
  };


  //
  // Player states
  //

  var playerMovingStateFuncs = {
    'update': function (player, dt)
    {
      if (player.userData.health <= 0.0) {
        player.changeState(player.DYING);
        return;
      }

      if (ludum.isKeyPressed(ludum.keycodes.SPACE)) {
        player.changeState(player.ATTACKING);
        return;
      }

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


  var playerAttackingStateFuncs = {
    'enter': function (player)
    {
      player.userData.attackDelivered = false;
    },


    'update': function (player, dt)
    {
      if (player.userData.health <= 0.0) {
        player.changeState(player.DYING);
        return;
      }

      // Damage arrives halfway through the swing.
      if (player.stateT >= player.userData.attackDuration * 0.5 && !player.userData.attackDelivered) {
        // Deliver damage to all enemies within range.
        // TODO: restrict this to all enemies within some angle either side of the attack direction.
        for (var i = 0, end = enemies.length; i < end; ++i) {
          var enemy = enemies[i];
          var dx = enemy.userData.x - player.userData.x;
          var dy = enemy.userData.y - player.userData.y;
          var length = Math.sqrt(dx * dx + dy * dy);
          if (length < player.userData.attackRange)
            takeDamage(enemy, player.userData.damage, player);
        }
        player.userData.attackDelivered = true;
      }

      // If the swing has finished, switch back to the chasing state.
      if (player.stateT >= player.userData.attackDuration)
        player.changeState(player.MOVING);
    }
  };


  var playerDyingStateFuncs = {
    'update': function (player, dt)
    {
      if (player.stateT >= player.userData.deathDuration)
        player.userData.dead = true;
    }
  };


  //
  // Enemy states
  //

  var enemyIdleStateFuncs = {
    'update': function (enemy, dt)
    {
      // If health has reached zero, start dying.
      if (enemy.userData.health <= 0.0) {
        enemy.changeState(enemy.DYING);
        return;
      }

      // If we can see the player, start running at them!
      if (canSee(enemy, player))
        enemy.changeState(enemy.CHASING);
    }
  };


  var enemyChasingStateFuncs = {
    'update': function (enemy, dt)
    {
      // If health has reached zero, start dying.
      if (enemy.userData.health <= 0.0) {
        enemy.changeState(enemy.DYING);
        return;
      }

      // If we can no longer see the player, go back to doing nothing.
      if (!canSee(enemy, player)) {
        enemy.changeState(enemy.IDLE);
        return;
      }

      // If we're not within attacking distance of the player, move towards them.
      var dx = player.userData.x - enemy.userData.x;
      var dy = player.userData.y - enemy.userData.y;
      var length = Math.sqrt(dx * dx + dy * dy);
      if (length > enemy.userData.attackRange) {
        var mx = dx / length * dt * enemy.userData.speed;
        var my = dy / length * dt * enemy.userData.speed;
        enemy.userData.x = ludum.clamp(enemy.userData.x + mx, level.x, level.x + level.w);
        enemy.userData.y = ludum.clamp(enemy.userData.y + my, level.y, level.y + level.h);
      }

      // If we are now within attacking range of the player, attack them!
      var dx = player.userData.x - enemy.userData.x;
      var dy = player.userData.y - enemy.userData.y;
      var length = Math.sqrt(dx * dx + dy * dy);
      if (length < enemy.userData.attackRange)
        enemy.changeState(enemy.ATTACKING);
    }
  };


  var enemyAttackingStateFuncs = {
    'enter': function (enemy)
    {
      enemy.userData.attackDelivered = false;
    },


    'update': function (enemy, dt)
    {
      // If health has reached zero, start dying.
      if (enemy.userData.health <= 0.0) {
        enemy.changeState(enemy.DYING);
        return;
      }

      // Damage arrives halfway through the swing.
      if (enemy.stateT >= enemy.userData.attackDuration * 0.5 && !enemy.userData.attackDelivered) {
        // Check if the player is still within range.
        var dx = player.userData.x - enemy.userData.x;
        var dy = player.userData.y - enemy.userData.y;
        var length = Math.sqrt(dx * dx + dy * dy);
        if (length < enemy.userData.attackRange)
          takeDamage(player, enemy.userData.damage, enemy);
        enemy.userData.attackDelivered = true;
      }

      // If the swing has finished, switch back to the chasing state.
      if (enemy.stateT >= enemy.userData.attackDuration)
        enemy.changeState(enemy.CHASING);
    }
  };


  var enemyDyingStateFuncs = {
    'update': function (enemy, dt)
    {
      if (enemy.stateT >= enemy.userData.deathDuration)
        enemy.userData.dead = true;
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
    var xTiles = Math.min(level.width, canvas.width / level.tilewidth);
    var yTiles = Math.min(level.height, canvas.height / level.tileheight);

    var left = ludum.clamp(Math.floor((view.x - level.x) / level.tilewidth), 0, level.width);
    var right = ludum.clamp(Math.ceil((view.x + canvas.width - level.x) / level.tilewidth), 0, level.width);
    var bottom = ludum.clamp(Math.floor((view.y - level.y) / level.tileheight), 0, level.height);
    var top = ludum.clamp(Math.ceil((view.y + canvas.height - level.y) / level.tileheight), 0, level.height);

    var x = level.x - view.x;
    var y = level.y - view.y;

    for (var l = 0, endL = level.layers.length; l < endL; ++l) {
      var layer = level.layers[l];
      if (layer.type != "tilelayer")
        continue;

      for (var r = bottom; r < top; ++r) {
        var ty = y + r * level.tileheight;
        for (var c = left; c < right; ++c) {
          var tx = x + c * level.tilewidth;
          var tileNum = r * level.width + c;
          var tileID = layer.data[tileNum];
          if (tileID === 0)
            continue;
          
          var tileset = level.tilesetByTileID[tileID];
          tileID -= tileset.firstgid;
          var scols = Math.ceil(tileset.imagewidth / tileset.tilewidth);
          var sr = Math.floor(tileID / scols);
          var sc = tileID % scols;
          var sx = sc * tileset.tilewidth;
          var sy = sr * tileset.tileheight;
          ctx.drawImage(tileset.image, sx, sy, tileset.tilewidth, tileset.tileheight, tx, ty, tileset.tilewidth, tileset.tileheight);
        }
      }
    }
  }


  function drawPlayer(entity)
  {
    var x = entity.x - view.x - entity.w / 2.0;
    var y = entity.y - view.y - entity.h / 2.0;

    x = ludum.clamp(x, 0, canvas.width);
    y = ludum.clamp(y, 0, canvas.height);

    ctx.fillStyle = COLORS.player;
    ctx.fillRect(x, y, entity.w, entity.h);

    ctx.fillStyle = COLORS.loadingText;
    ctx.font = FONTS.loadingText;
    var msg = "Health " + ludum.roundTo(entity.health, 0);
    ctx.fillText(msg, 32, 32);
  }


  function drawEnemy(entity)
  {
    var x = entity.x - view.x - entity.w / 2.0;
    var y = entity.y - view.y - entity.h / 2.0;

    ctx.fillStyle = COLORS.enemy;
    ctx.fillRect(x, y, entity.w, entity.h);

    ctx.fillStyle = COLORS.loadingText;
    ctx.font = FONTS.loadingText;
    ctx.fillText(ludum.roundTo(entity.health, 0), x + 4, y + entity.h - 4);
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
      x = level.x + level.tilewidth / 2 + Math.floor(Math.random() * level.w / level.tilewidth) * level.tilewidth;
    if (y === undefined)
      y = level.y + level.tileheight / 2 + Math.floor(Math.random() * level.h / level.tileheight) * level.tileheight;
    enemy.userData.x = x;
    enemy.userData.y = y;

    enemy.start();
    enemies.push(enemy);
    ++totalSpawned;
  }


  function canSee(enemy, player)
  {
    var dx = player.userData.x - enemy.userData.x;
    var dy = player.userData.y - enemy.userData.y;
    var distanceSqr = dx * dx + dy * dy;
    return (distanceSqr < MAX_VISIBLE_DISTANCE_SQR);
  }


  function takeDamage(entity, damage, attacker)
  {
    if (entity.userData.health <= 0.0)
      return;

    entity.userData.health -= damage;
    if (entity.userData.health < 0.0)
      entity.userData.health = 0.0;

    var msg = attacker.name + " hit " + entity.name + " for " + damage + " points of damage";
    console.log(msg);
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
    game.addState('GAME_OVER', gameOverFuncs);
    //game.addState('HIGHSCORES', highScoresFuncs);
    //game.addState('CREDITS', creditsFuncs);

    //game.setInitialState(game.STARTING_GAME); // For debugging

    defaultPlayer.logging = true;
    defaultPlayer.addState('MOVING', playerMovingStateFuncs);
    defaultPlayer.addState('ATTACKING', playerAttackingStateFuncs);
    defaultPlayer.addState('DYING', playerDyingStateFuncs);

    defaultEnemy.logging = true;
    defaultEnemy.addState('IDLE', enemyIdleStateFuncs);
    defaultEnemy.addState('CHASING', enemyChasingStateFuncs);
    defaultEnemy.addState('ATTACKING', enemyAttackingStateFuncs);
    defaultEnemy.addState('DYING', enemyDyingStateFuncs);

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
