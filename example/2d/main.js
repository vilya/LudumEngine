// Include ludum.min.js before this file.
if (!ludum)
  throw Error("you must include ludum.min.js before this file");

var example2d = function () {

  //
  // Global variables
  //

  var canvas; // The main game window element.
  var ctx;    // The drawing context for the game (a 2D context in this case).
  var loader; // The asset loader. This is configured and started when we enter the 'loading' state.

  var menuOption;         // The index of the current selected option in the main menu.
  var settingsMenuOption; // The index of the current selected option in the settings menu.


  //
  // Loading state
  //

  var loadingFuncs = {
    // Create, configure and start the asset loader.
    'enter': function ()
    {
      // Create the asset loader.
      //loader = new ludum.Loader();

      // Configure all the assets to be loaded.
      // TODO

      // Start loading.
      //loader.start();
    },


    // Draw the loading screen.
    'draw': function ()
    {
      //var progress = loader.fractionComplete();
      var progress = ludum.game.userData.stateT / 5.0;

      clearScreen("#AAAAAA");

      // Draw the loading bar outline.
      var w = canvas.width * 0.9;
      var h = 32;
      var x = (canvas.width - w) / 2.0;
      var y = (canvas.height - h) / 2.0;
      ctx.strokeStyle = "#0077AA";
      ctx.strokeRect(x, y, w, h);

      // Draw the loading bar progress rect.
      w *= progress;
      ctx.fillStyle = "#0077AA";
      ctx.fillRect(x, y, w, h);

      // Draw the loading text.
      var msg = ludum.roundTo(progress * 100.0, 0) + "%";
      ctx.font = "24px SansSerif";
      w = ctx.measureText(msg).width;
      h = 24;
      x = (canvas.width - w) / 2.0;
      y = (canvas.height + h) / 2.0 - 4;
      ctx.fillStyle = "#00AABB";
      ctx.fillText(msg, x, y);
    },


    // Check whether we've finished loading. If so, switch to the MENU state.
    'update': function (dt)
    {
      //var progress = loader.fractionComplete();
      var progress = ludum.game.userData.stateT / 5.0;
      if (progress >= 1.0)
        ludum.game.changeState(ludum.game.MENU);
    },


    'leave': function ()
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
    'enter': function ()
    {
      menuOption = 0;
    },


    // Draw the menu.
    'draw': function ()
    {
      clearScreen("#AAAAAA");
      drawMenu(menuOption,
        "Play game",
        "Settings",
        "High scores",
        "Credits"
      );
    },


    // Handle keystrokes and mouse clicks.
    'update': function (dt)
    {
      var targetStates = [
        ludum.game.LOADING,
        ludum.game.LOADING,
        ludum.game.LOADING,
        ludum.game.LOADING
      ];

      // If the player is pressing space or enter, accept the current menu
      // option.
      if (ludum.isKeyPressed(ludum.keycodes.ENTER) || ludum.isKeyPressed(ludum.keycodes.SPACE)) {
        ludum.clearKeyboard();
        ludum.game.changeState(targetStates[menuOption]);
        return;
      }
 
      // If the player is pressing UP or DOWN, change the selected menu option.
      var menuOptionChange = 0;
      if (ludum.isKeyPressed(ludum.keycodes.UP))
        --menuOptionChange;
      if (ludum.isKeyPressed(ludum.keycodes.DOWN))
        ++menuOptionChange;
  
      if (menuOptionChange !== 0) {
        menuOption = ludum.clamp(menuOption + menuOptionChange, 0, targetStates.length - 1);
        ludum.clearKeyboard();
      }
    },
  };


  //
  // Drawing functions
  //

  function clearScreen(bgColor)
  {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }


  function drawMenu(selectedIndex /*, entry 1, entry 2, ... */)
  {
    ctx.font = "48px SansSerif";

    var numEntries = arguments.length - 1;

    var w = 0;
    var h = 48;
    var lineSpacing = 16;
    for (var i = 1, endI = arguments.length; i < endI; ++i)
      w = Math.max(w, ctx.measureText(arguments[i]).width);
    var totalHeight = h * numEntries + lineSpacing * (numEntries - 1);
    var x = (canvas.width - w) / 2.0;
    var y = (canvas.height - totalHeight + h) / 2.0;

    for (var i = 1, endI = arguments.length; i < endI; ++i) {
      if ((i - 1) == selectedIndex) {
        ctx.font = "56px SansSerif";
        ctx.fillStyle = "#0000BB";
      }
      else {
        ctx.font = "48px SansSerif";
        ctx.fillStyle = "#00AABB";
      }
      ctx.fillText(arguments[i], x, y);
      y += h + lineSpacing;
    }
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

    ludum.game.addState('LOADING', loadingFuncs);
    ludum.game.addState('MENU', menuFuncs);
    //ludum.game.addState('SETTINGS', settingsFuncs);
    //ludum.game.addState('PLAYING', playingFuncs);
    //ludum.game.addState('PAUSED', playingFuncs);
    //ludum.game.addState('WIN', winFuncs);
    //ludum.game.addState('LOSE', loseFuncs);
    //ludum.game.addState('HIGHSCORES', highScoresFuncs);
    //ludum.game.addState('CREDITS', creditsFuncs);

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
