// This is a reimplementation of my entry for Ludum Dare 24, using this game
// engine.

// requires ludum.js
var invaders = function () { // start of the invaders namespace

  //
  // Constants
  //

  // Text alignment.
  var ALIGN_LEFT = 1;
  var ALIGN_MIDDLE = 2;
  var ALIGN_RIGHT = 3;
  var ALIGN_TOP = 1;
  var ALIGN_BOTTOM = 3;

  // Font settings.
  var ICON_FONT_SIZE = 42;
  var ICON_FONT_NAME = "PixelInvaders";

  var TITLE_FONT_SIZE = 42;
  var TITLE_FONT_NAME = "Pixelate";

  var DIALOGUE_FONT_SIZE = 21;
  var DIALOGUE_FONT_NAME = "Pixelate";

  // Movement directions for the aliens.
  var ALIEN_MOVE_LEFT = 1;
  var ALIEN_MOVE_RIGHT = 2;
  var ALIEN_MOVE_DOWN = 3;
  

  //
  // Global variables
  //

  // The canvas object we use for drawing.
  var canvas;
  // The drawing context from the canvas.
  var ctx;


  //
  // Game data
  //

  var game = {
    // Player data.
    'player': {
      'x': 0,
      'y': 0,
      'w': 0,
      'h': 0,
      'color': "#00FF00",
      'shape': "Q",
      'speed': 128.0,   // pixels per second
      'canMove': true,  // Whether the player can move at the moment.
      'canFire': true,  // Whether the player can fire at the moment.
      'dead': false,    // Whether the player has died.
    },

    // Alien data.
    'numAliens': 0,
    'numAliensSpawned': 0,
    'aliens': {
      'cellWidth': 0,
      'cellHeight': 0,
      'numPerRow': 8,
      'showFriends': false,
      'speed': 48.0,      // pixels per second
      'minBombDT': 1000,  // min time, in milliseconds, between dropping two bombs.
      'bombP': 0.5,       // probability of dropping a bomb on any given frame.
      'friendColor': "#00FF00",
      'enemyColor': "#FFFFFF",
      'states': [ ALIEN_MOVE_LEFT, ALIEN_MOVE_DOWN, ALIEN_MOVE_RIGHT, ALIEN_MOVE_DOWN ],
      'state': 0,
      'x': [],
      'y': [],
      'w': [],
      'h': [],
      'shape': [],
      'isFriendly': [],
      'lastBombT': 0,
      'canMove': true,  // Whether the aliens can move at the moment.
      'canFire': true,  // Whether the aliens can fire at the moment.
    },

    // Bullets (fired by the player)
    'numBullets': 0,
    'maxBullets': 12,
    'bullets': {
      'w': 0,
      'h': 0,
      'color': "#990000",
      'speed': 192.0, // pixels per second
      'xOfs': 0,
      'yOfs': 0,
      'x': [],
      'y': [],
    },

    // Bombs (fired by the aliens)
    'numBombs': 0,
    'bombs': {
      'w': 0,
      'h': 0,
      'color': "#999900",
      'speed': 100.0, // pixels per second
      'xOfs': 0,
      'yOfs': 0,
      'x': [],
      'y': [],
    },
  };


  //
  // The 'titles' state
  //

  function drawTitles() {
    drawBackground();

    ctx.fillStyle = "#FFFFFF";
    drawText("Invaders: Evolution", TITLE_FONT_SIZE, 0, 0, ALIGN_MIDDLE, ALIGN_MIDDLE);
    drawText("press <space> to play", TITLE_FONT_SIZE / 2, 0, TITLE_FONT_SIZE, ALIGN_MIDDLE, ALIGN_MIDDLE);
  }

  
  //
  // The 'level1' state
  //

  function initLevel1() {
    gameInit();
    // Make sure the aliens can't fire.
    game.aliens.canFire = false;
  }

  function level1Victory() {
    return (game.numAliensSpawned > 0 && game.numAliens == 0);
  }


  //
  // The 'level2' state
  //

  function initLevel2() {
  }

  function level2Victory() {
    var fourRows = 4 * game.aliens.numPerRow;
    return (game.numAliensSpawned >= fourRows) && (game.numAliens == 0);
  }


  //
  // Helper functions
  //

  function drawPlaying() {
    drawBackground();
    drawAliens();
    drawPlayer();
    drawBullets();
    drawBombs();
  }

  function drawInterlude() {
    drawBackground();
    drawAliens();
  }

  function drawBackground() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawPlayer() {
    ctx.fillStyle = game.player.color;
    drawIcon(game.player.shape, game.player.x, game.player.y);
  }

  function drawAliens() {
    for (var i = 0; i < game.numAliens; i++) {
      if (game.aliens.showFriends && game.aliens.isFriendly[i])
        ctx.fillStyle = game.aliens.friendColor;
      else
        ctx.fillStyle = game.aliens.enemyColor;
      drawIcon(game.aliens.shape[i], game.aliens.x[i], game.aliens.y[i]);
    }
  }

  function drawBullets() {
    ctx.fillStyle = game.bullets.color;
    for (var i = 0; i < game.numBullets; i++)
      ctx.fillRect(game.bullets.x[i], game.bullets.y[i], game.bullets.w, game.bullets.h);
  }

  function drawBombs() {
    ctx.fillStyle = game.bombs.color;
    for (var i = 0; i < game.numBombs; i++)
      ctx.fillRect(game.bombs.x[i], game.bombs.y[i], game.bombs.w, game.bombs.h);
  }

  function drawText(msg, size, x, y, halign, valign, fontname) {
    if (!fontname)
      fontname = TITLE_FONT_NAME;
    ctx.font = size + "px " + fontname;
    var textWidth = ctx.measureText(msg);
    var textX, textY;
    if (halign == ALIGN_LEFT)
      textX = x;
    else if (halign == ALIGN_RIGHT)
      textX = canvas.width - textWidth.width - x;
    else
      textX = (canvas.width - textWidth.width) / 2 + x;
    if (valign == ALIGN_TOP)
      textY = size + y;
    else if (valign == ALIGN_BOTTOM)
      textY = canvas.height - y;
    else
      textY = canvas.height / 2 + y;
    ctx.fillText(msg, textX, textY);
  }

  function drawIcon(icon, x, y) {
    ctx.font = ICON_FONT_SIZE + "px " + ICON_FONT_NAME;
    ctx.fillText(icon, x, y);
  }

  function drawDialogue(msg, x, y, halign, valign) {
    ctx.fillStyle = "#990000";
    drawText(msg, DIALOGUE_FONT_SIZE, x, y, halign, valign, DIALOGUE_FONT_NAME);
  }

  function gameInit() {
    ctx.font = ICON_FONT_SIZE + "px " + ICON_FONT_NAME;

    // Set up the player.
    var tw = ctx.measureText(game.player.shape);
    game.player.x = (canvas.width - tw.width) / 2;
    game.player.y = (canvas.height - 10);
    game.player.w = tw.width - 4;
    game.player.h = ICON_FONT_SIZE / 2;

    // Set up the aliens.
    game.aliens.cellWidth = canvas.width / (game.aliens.numPerRow + 2);
    game.aliens.cellHeight = ICON_FONT_SIZE + 10;

    ctx.font = ICON_FONT_SIZE + "px " + TITLE_FONT_NAME;

    // Set up the bullets.
    tw = ctx.measureText('i');
    game.numBullets = 0;
    game.bullets.w = tw.width * 0.5;
    game.bullets.h = ICON_FONT_SIZE * 0.33;
    game.bullets.xOfs = (game.player.w - game.bullets.w) / 2;
    game.bullets.yOfs = game.bullets.h + game.player.h;

    // Set up the bombs.
    tw = ctx.measureText('o');
    game.numBombs = 0;
    game.bombs.w = tw.width * 0.5;
    game.bombs.h = ICON_FONT_SIZE * 0.33;
    game.bombs.xOfs = (game.player.w - game.bombs.w) / 2;
    game.bombs.yOfs = game.bombs.h / 2;
  }

  function updatePlaying(dt) {
    updateBullets(dt);
    updateBombs(dt);

    collisionTestBulletsToAliens();
    collisionTestBombsToPlayer();
    collisionTestAliensToPlayer();
    collisionTestAliensToPlanet();

    updatePlayer(dt);
    updateAliens(dt);
  }

  function resetAll() {
    resetPlayer();
    resetAliens();
    resetBullets();
    resetBombs();
  }

  function resetPlayer() {
    game.player.canMove = true;
    game.player.canFire = true;
    game.player.dead = false;
  }

  function updatePlayer(dt) {
    if (game.player.canFire && game.keysDown[' ']) {
      spawnBullet();
      game.keysDown[' '] = false;
    }
    if (game.player.canMove) {
      var speed = game.player.speed * dt;
      var move = 0;
      if (game.keysDown[KEY_LEFT_ARROW])
        move -= speed;
      if (game.keysDown[KEY_RIGHT_ARROW])
        move += speed;
      var minX = 0;
      var maxX = canvas.width - game.player.w;
      game.player.x = clamp(minX, maxX, game.player.x + move);
    }
  }

  function expirePlayer() {
    game.player.dead = true;
  }

  function isPlayerDead() {
    return game.player.dead;
  }

  function resetAliens() {
    game.numAliens = 0;
    game.numAliensSpawned = 0;
    game.aliens.showFriends = false;
    game.aliens.state = ALIEN_MOVE_LEFT;
    game.aliens.w = [];
    game.aliens.h = [];
    game.aliens.x = [];
    game.aliens.y = [];
    game.aliens.shape = [];
    game.aliens.isFriendly = [];
    game.aliens.lastBombT = game.lastT;
    game.aliens.canMove = true;
    game.aliens.canFire = true;
  }

  function updateAliens(dt) {
    if (game.numAliens == 0)
      return;

    var lowX = game.aliens.x[0];
    var highX = lowX + game.aliens.w[0];
    var lowY = game.aliens.y[0] - game.aliens.h[0];
    var highY = lowY + game.aliens.h[0];
    for (var i = 1; i < game.numAliens; i++) {
      var x = game.aliens.x[i];
      var y = game.aliens.y[i] - game.aliens.h[i];
      var x2 = x + game.aliens.w[i];
      var y2 = y + game.aliens.h[i];
      if (x < lowX)
        lowX = x;
      if (x2 > highX)
        highX = x2;

      if (y < lowY)
        lowY = y;
      if (y2 > highY)
        highY = y2;
    }

    var minX = 0;
    var maxX = canvas.width;
    var nextRow = Math.floor(highY / game.aliens.cellHeight) + 1;
    var nextRowY = nextRow * game.aliens.cellHeight;
    var moveDir = game.aliens.states[game.aliens.state];
    var dx = 0;
    var dy = 0;
    if (moveDir == ALIEN_MOVE_LEFT) {
      dx = game.aliens.speed * dt;
      lowX -= dx;
      if (lowX <= minX) {
        dx -= (minX - lowX);
        game.aliens.state = (game.aliens.state + 1) % game.aliens.states.length;
      }
      dx = -dx;
    }
    else if (moveDir == ALIEN_MOVE_RIGHT) {
      dx = game.aliens.speed * dt;
      highX += dx;
      if (highX >= maxX) {
        dx -= (highX - maxX);
        game.aliens.state = (game.aliens.state + 1) % game.aliens.states.length;
      }
    }
    else if (moveDir == ALIEN_MOVE_DOWN) {
      dy = game.aliens.speed * dt;
      highY += dy;
      if (highY >= nextRowY) {
        dy -= (highY - nextRowY);
        game.aliens.state = (game.aliens.state + 1) % game.aliens.states.length;
      }
    }

    for (var i = 0; i < game.numAliens; i++) {
      game.aliens.x[i] += dx;
      game.aliens.y[i] += dy;
    }

    moveDir = game.aliens.states[game.aliens.state];
    var dtBomb = game.lastT - game.aliens.lastBombT;
    var canBomb = game.aliens.canFire && (dtBomb > game.aliens.minBombDT);
    canBomb = canBomb && (moveDir == ALIEN_MOVE_LEFT || moveDir == ALIEN_MOVE_RIGHT);
    if (canBomb) {
      if (Math.random() < game.aliens.bombP) {
        var i = (Math.floor(Math.random() * game.numAliens)) % game.numAliens;
        if (game.aliens.showFriends) {
          while (game.aliens.isFriendly[i])
            i = (Math.floor(Math.random() * game.numAliens)) % game.numAliens;
        }
        spawnBomb(i);
      }
    }
  }

  function spawnRowOfAliens(shape, y) {
    ctx.font = ICON_FONT_SIZE + "px " + ICON_FONT_NAME;
    tw = ctx.measureText(shape);
    var pFriendly = 0.4;
    var xOfs = (game.aliens.cellWidth - tw.width) / 2;
    for (var i = 1; i <= game.aliens.numPerRow; i++) {
      game.aliens.shape.push(shape);
      game.aliens.w.push(tw.width);
      game.aliens.h.push(ICON_FONT_SIZE);
      game.aliens.x.push(game.aliens.cellWidth * i + xOfs);
      game.aliens.y.push(y);
      game.aliens.isFriendly.push(Math.random() < pFriendly);
      game.numAliens++;
      game.numAliensSpawned++;
    }
  }

  function spawnAlien(shape, x, y) {
    ctx.font = ICON_FONT_SIZE + "px " + ICON_FONT_NAME;
    tw = ctx.measureText(shape);
    var xOfs = (game.aliens.cellWidth - tw.width) / 2;
    game.aliens.shape.push(shape);
    game.aliens.w.push(tw.width);
    game.aliens.h.push(ICON_FONT_SIZE);
    game.aliens.x.push(x);
    game.aliens.y.push(y);
    game.aliens.isFriendly.push(false);
    game.numAliens++;
    game.numAliensSpawned++;
  }

  function expireAlien(i) {
    if (i >= game.numAliens)
      return;
    game.aliens.shape.splice(i, 1);
    game.aliens.w.splice(i, 1);
    game.aliens.h.splice(i, 1);
    game.aliens.x.splice(i, 1);
    game.aliens.y.splice(i, 1);
    game.aliens.isFriendly.splice(i, 1);
    game.numAliens--;
  }

  function resetBullets() {
    game.numBullets = 0;
    game.bullets.x = [];
    game.bullets.y = [];
  }

  function updateBullets(dt) {
    var move = game.bullets.speed * dt;
    for (var i = game.numBullets - 1; i >= 0; i--) {
      game.bullets.y[i] -= move;
      if (game.bullets.y[i] < -game.bullets.h)
        expireBullet(i);
    }
  }

  function spawnBullet() {
    if (game.numBullets >= game.maxBullets)
      return;
    var i = game.numBullets;
    game.bullets.x[i] = game.player.x + game.bullets.xOfs;
    game.bullets.y[i] = game.player.y - game.bullets.yOfs;
    game.numBullets++;
  }

  function expireBullet(i) {
    if (i >= game.numBullets)
      return;
    var j = game.numBullets - 1;
    game.bullets.x[i] = game.bullets.x[j];
    game.bullets.y[i] = game.bullets.y[j];
    game.numBullets--;
  }

  function resetBombs() {
    game.numBombs = 0;
    game.bombs.x = [];
    game.bombs.y = [];
  }

  function updateBombs(dt) {
    var move = game.bombs.speed * dt;
    for (var i = game.numBombs - 1; i >= 0; i--) {
      game.bombs.y[i] += move;
      if (game.bombs.y[i] > canvas.height)
        expireBomb(i);
    }
  }

  function spawnBomb(alienIndex) {
    var i = game.numBombs;
    game.bombs.x[i] = game.aliens.x[alienIndex];
    game.bombs.y[i] = game.aliens.y[alienIndex];
    game.numBombs++;
    game.aliens.lastBombT = game.lastT;
  }

  function expireBomb(i) {
    if (i >= game.numBombs)
      return;
    var j = game.numBombs - 1;
    game.bombs.x[i] = game.bombs.x[j];
    game.bombs.y[i] = game.bombs.y[j];
    game.numBombs--;
  }


  //
  // Collision testing and handling
  //

  function collisionTestBulletsToAliens() {
    for (var a = game.numAliens - 1; a >= 0; a--) {
      var aL = game.aliens.x[a];
      var aR = aL + game.aliens.w[a];
      var aT = game.aliens.y[a];
      var aB = aT - game.aliens.h[a];
      for (var b = game.numBullets - 1; b >= 0; b--) {
        var bL = game.bullets.x[b]; 
        var bR = bL + game.bullets.w;
        var bT = game.bullets.y[b];
        var bB = bT - game.bullets.h;
        if (bL <= aR && bR >= aL && bB <= aT && bT >= aT) {
          expireAlien(a);
          expireBullet(b);
        }
      }
    }
  }

  function collisionTestBombsToPlayer() {
    var pL = game.player.x;
    var pR = pL + game.player.w;
    var pT = game.player.y;
    var pB = pT - game.player.h;
    for (var b = game.numBombs - 1; b >= 0; b--) {
      var bL = game.bombs.x[b]; 
      var bR = bL + game.bombs.w;
      var bT = game.bombs.y[b];
      var bB = bT - game.bombs.h;
      if (bL <= pR && bR >= pL && bB <= pT && bT >= pT) {
        expireBomb(b);
        expirePlayer();
      }
    }
  }

  function collisionTestAliensToPlayer() {
    var pL = game.player.x;
    var pR = pL + game.player.w;
    var pT = game.player.y;
    var pB = pT - game.player.h;
    for (var a = game.numAliens - 1; a >= 0; a--) {
      if (game.aliens.showFriends && game.aliens.isFriendly[a])
        continue;
      var aL = game.aliens.x[a];
      var aR = aL + game.aliens.w[a];
      var aT = game.aliens.y[a];
      var aB = aT - game.aliens.h[a];
      if (aT <= pB && aB >= pT && aL <= pR && aR >= pB) {
        expireAlien(a);
        expirePlayer();
      }
    }
  }

  function collisionTestAliensToPlanet() {
    for (var i = 0; i < game.numAliens; i++) {
      if (game.aliens.showFriends && game.aliens.isFriendly[i])
        continue;
      if (game.aliens.y[i] > canvas.height)
        expirePlayer();
    }
  }


  //
  // Event helpers
  //

  function addDialogueAtTimeEvent(stateName, t, duration, speaker, text) {
    ludum.addTimeEvent(stateName, t, duration, {
      'draw': function () {
        drawDialog(text, speaker.x, speaker.y, speaker.halign, speaker.valign);
      }
    });
  }

  function addSpawnAlienAtTimeEvent(stateName, t, shape, x, y) {
    ludum.addTimeEvent(stateName, t, 0.0, {
      'enter': function () {
        spawnAlien(shape, x, y);
      }
    });
  }

  function addExpireAlienAtTimeEvent(stateName, t, alienNum) {
    ludum.addTimeEvent(stateName, t, 0.0, {
      'enter': function () {
        expireAlien(alienNum);
      }
    });
  }

  function addSpawnRowOfAliensAtTimeEvent(stateName, t, shape, y) {
    ludum.addTimeEvent(stateName, t, 0.0, {
      'enter': function () {
        spawnRowOfAliens(shape, y);
      }
    });
  }


  //
  // Main
  //

  function run() {
    ludum.addState('titles', { 'draw': drawTitles });
    ludum.addChangeStateOnKeyPressEvent('titles', " ", 'level1');

    ludum.addState('level1', { 'draw': drawPlaying, 'update': updatePlaying, 'enter': initLevel1 });
    addSpawnAlienAtTimeEvent('level1', 0.5, "H", 0, 0);
    ludum.addGameConditionEvent('level1', level1Victory, 'interlude1');
    ludum.addGameConditionEvent('level1', isPlayerDead, 'lose');

    ludum.addState('interlude1', { 'draw': drawInterlude });
    narrator = { 'x': 0, 'y': 0, 'halign': ALIGN_MIDDLE, 'valign': ALIGN_MIDDLE };
    speaker1 = { 'x': 0, 'y': 10, 'halign': ALIGN_MIDDLE, 'valign': ALIGN_TOP };
    speaker1 = { 'x': 0, 'y': 0, 'halign': ALIGN_MIDDLE, 'valign': ALIGN_MIDDLE };
    addDialogueAtTimeEvent('interlude1', 0.1, 1.8, narrator, "Meanwhile, back on Zorlaxx...");
    addSpawnAlienAtTimeEvent('interlude1', 0.5, "G", 100, 100);
    addSpawnAlienAtTimeEvent('interlude1', 0.5, "H", 150, 80);
    addDialogueAtTimeEvent('interlude1',  2.0, 2.0, speaker1, "The humans shot down our trade envoy!");
    addDialogueAtTimeEvent('interlude1',  4.0, 2.0, speaker1, "This means war!");
    addDialogueAtTimeEvent('interlude1',  6.0, 2.0, speaker2, "Maybe it was just a misunderstanding?");
    addDialogueAtTimeEvent('interlude1',  8.0, 2.0, speaker1, "No one could be that stupid.");
    addDialogueAtTimeEvent('interlude1', 10.0, 2.0, speaker1, "Not even the humans!");
    addExpireAlienAtTimeEvent('interlude1', 13.0, 1);
    addExpireAlienAtTimeEvent('interlude1', 13.0, 0);
    ludum.addChangeStateAtTimeEvent('interlude1', 14.0, 'level2');

    ludum.addState('level2', { 'draw': drawPlaying, 'update': updatePlaying });
    var dt = (game.aliens.cellWidth * 4 + game.aliens.cellHeight) / game.aliens.speed;
    addSpawnRowOfAliensAtTimeEvent('level2', 0.5         , "A", 0);
    addSpawnRowOfAliensAtTimeEvent('level2', 0.5 + 1 * dt, "B", 0);
    addSpawnRowOfAliensAtTimeEvent('level2', 0.5 + 2 * dt, "C", 0);
    addSpawnRowOfAliensAtTimeEvent('level2', 0.5 + 3 * dt, "D", 0);
    ludum.addGameConditionEvent('level2', level2Victory, 'interlude2');
    ludum.addGameConditionEvent('level2', isPlayerDead, 'lose');

    ludum.addState('interlude2', { 'draw': drawInterlude, 'enter': initInterlude });

    ludum.addState('level3', { 'draw': drawPlaying, 'update': updatePlaying });
    // ...

    ludum.addState('interlude3', { 'draw': drawInterlude });
    // ...

    ludum.addState('level4', { 'draw': drawPlaying, 'update': updatePlaying });
    // ...

    ludum.addState('peaceTalks', { 'draw': drawInterlude });
    // ...

    ludum.addState('extinction', { 'draw': drawPlaying, 'update': updatePlaying });
    // ...

    ludum.addState('win', { 'draw': drawWin });
    ludum.addTimeEvent('win', 5.0, 0.0, { 'enter': function () { ludum.changeState('titles'); } });

    ludum.addState('lose', { 'draw': drawLose });
    ludum.addTimeEvent('lose', 5.0, 0.0, { 'enter': function () { ludum.changeState('titles'); } });
  }

  // Exported symbols
  return {
    'run': run
  };
} (); // end of the invaders namespace

