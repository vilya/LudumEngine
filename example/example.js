// require("invader.js")

function drawTitles() { ... }

function drawLevel1() { ... }
function updateLevel1() { ... }
function initLevel1() { ... }
function level1Victory() { ... }
function level1Loss() { ... }

function spawnAlien(...) { ... }

function run() {
  Invader.addState('titles');
  Invader.addAlwaysOnEvent('titles', { 'draw': drawTitles });
  Invader.addChangeStateOnKeyPressEvent('titles', " ", 'level1');

  Invader.addState('level1');
  // General level update and drawing code:
  Invader.addAlwaysOnEvent('level1', { 'draw': drawLevel1, 'update': updateLevel1, 'enter': initLevel1 });
  // Spawn the trade envoy.
  Invader.addTimeEvent('level1', 0.5, 0.0, { 'enter': function () { spawnAlien('H', 0, 0); } });
  // Check whether the trade envoy's been shot down yet.
  Invader.addGameConditionEvent('level1', level1Victory, 'interlude1');
  // Check whether any of the loss conditions are met.
  Invader.addGameConditionEvent('level1', level1Loss, 'lose');

  Invader.addState('interlude1');
  // ...

  Invader.addState('level2');
  // ...

  Invader.addState('interlude2');
  // ...

  Invader.addState('level3');
  // ...

  Invader.addState('interlude3');
  // ...

  Invader.addState('level4');
  // ...

  Invader.addState('peaceTalks');
  // ...

  Invader.addState('extinction');
  // ...

  Invader.addState('win');
  Invader.addAlwaysOnEvent('win', { 'draw': drawWin });
  Invader.addTimeEvent('win', 5.0, 0.0, { 'enter': function () { Invader.changeState('titles'); } });

  Invader.addState('lose');
  Invader.addAlwaysOnEvent('lose', { 'draw': drawLose });
  Invader.addTimeEvent('lose', 5.0, 0.0, { 'enter': function () { Invader.changeState('titles'); } });
}
