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
  };

  var FONTS = {
    'loadingText':        "24px SansSerif",
    'menuSelectedText':   "56px SansSerif",
    'menuUnselectedText': "48px SansSerif",
  };


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
      clearScreen(COLORS.background);
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
        ludum.game.PLAYING,
        ludum.game.SETTINGS,
        ludum.game.MENU,      // High scores screen isn't implemented yet.
        ludum.game.MENU       // Credits screen isn't implemented yet.
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
        menuOption += menuOptionChange;
        if (menuOption < 0)
          menuOption += targetStates.length;
        else if (menuOption >= targetStates.length)
          menuOption -= targetStates.length;
        ludum.clearKeyboard();
      }
    },
  };


  //
  // Settings menu state
  //

  var settingsFuncs = {
    // Reset the menu to the default state.
    'enter': function ()
    {
      settingsMenuOption = 0;
    },


    'draw': function ()
    {
      clearScreen(COLORS.background);
      drawMenu(settingsMenuOption,
        "Controls",
        "Video",
        "Audio",
        "Back to main menu"
      );
    },


    'update': function (dt)
    {
      var targetStates = [
        ludum.game.SETTINGS,  // Control settings aren't implemented yet.
        ludum.game.SETTINGS,  // Video settings aren't implemented yet.
        ludum.game.SETTINGS,  // Audio settings aren't implemented yet.
        ludum.game.MENU,
      ];

      // If the player is pressing space or enter, accept the current menu
      // option.
      if (ludum.isKeyPressed(ludum.keycodes.ENTER) || ludum.isKeyPressed(ludum.keycodes.SPACE)) {
        ludum.clearKeyboard();
        ludum.game.changeState(targetStates[settingsMenuOption]);
        return;
      }

      // If the player is pressing escape, take them back to the main menu.
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        ludum.clearKeyboard();
        ludum.game.changeState(ludum.game.MENU);
      }
 
      // If the player is pressing UP or DOWN, change the selected menu option.
      var menuOptionChange = 0;
      if (ludum.isKeyPressed(ludum.keycodes.UP))
        --menuOptionChange;
      if (ludum.isKeyPressed(ludum.keycodes.DOWN))
        ++menuOptionChange;
  
      if (menuOptionChange !== 0) {
        settingsMenuOption += menuOptionChange;
        if (settingsMenuOption < 0)
          settingsMenuOption += targetStates.length;
        else if (settingsMenuOption >= targetStates.length)
          settingsMenuOption -= targetStates.length;
        ludum.clearKeyboard();
      }
    },
  };


  //
  // PLaying state
  //

  var playingFuncs = {
    'enter': function ()
    {
    },


    'draw': function ()
    {
      clearScreen(COLORS.background);
    },


    'update': function ()
    {
      // If the player is pressing escape, take them back to the main menu.
      if (ludum.isKeyPressed(ludum.keycodes.ESCAPE)) {
        ludum.clearKeyboard();
        ludum.game.changeState(ludum.game.MENU);
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
    ctx.font = FONTS.menuUnselectedText;

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
        ctx.font = FONTS.menuSelectedText;
        ctx.fillStyle = COLORS.menuSelectedText;
      }
      else {
        ctx.font = FONTS.menuUnselectedText;
        ctx.fillStyle = COLORS.menuUnselectedText;
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
    ludum.game.addState('SETTINGS', settingsFuncs);
    ludum.game.addState('PLAYING', playingFuncs);
    //ludum.game.addState('PAUSED', pausedFuncs);
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
