// requires ludum.js

function drawTitles() { ... }

function drawLevel1() { ... }
function updateLevel1() { ... }
function initLevel1() { ... }
function level1Victory() { ... }
function level1Loss() { ... }

function spawnAlien(...) { ... }

function run() {
  ludum.addState('titles');
  ludum.addAlwaysOnEvent('titles', { 'draw': drawTitles });
  ludum.addChangeStateOnKeyPressEvent('titles', " ", 'level1');

  ludum.addState('level1');
  // General level update and drawing code:
  ludum.addAlwaysOnEvent('level1', { 'draw': drawLevel1, 'update': updateLevel1, 'enter': initLevel1 });
  // Spawn the trade envoy.
  ludum.addTimeEvent('level1', 0.5, 0.0, { 'enter': function () { spawnAlien('H', 0, 0); } });
  // Check whether the trade envoy's been shot down yet.
  ludum.addGameConditionEvent('level1', level1Victory, 'interlude1');
  // Check whether any of the loss conditions are met.
  ludum.addGameConditionEvent('level1', level1Loss, 'lose');

  ludum.addState('interlude1');
  // ...

  ludum.addState('level2');
  // ...

  ludum.addState('interlude2');
  // ...

  ludum.addState('level3');
  // ...

  ludum.addState('interlude3');
  // ...

  ludum.addState('level4');
  // ...

  ludum.addState('peaceTalks');
  // ...

  ludum.addState('extinction');
  // ...

  ludum.addState('win');
  ludum.addAlwaysOnEvent('win', { 'draw': drawWin });
  ludum.addTimeEvent('win', 5.0, 0.0, { 'enter': function () { ludum.changeState('titles'); } });

  ludum.addState('lose');
  ludum.addAlwaysOnEvent('lose', { 'draw': drawLose });
  ludum.addTimeEvent('lose', 5.0, 0.0, { 'enter': function () { ludum.changeState('titles'); } });
}
