module("states");

test("StateMachine.setInitialState", function () {
  var machine = new ludum.StateMachine("Foobar");
  equal(machine.nextState, 0, "Initial state defaults to zero.");
  throws(function () { machine.setInitialState(1); }, "Throws if you try to set the state to a number which hasn't been added yet.");
  throws(function () { machine.setInitialState(0); }, "Throws if you try to set the state to zero, even if it's already zero.");

  machine.addState('FOO');
  machine.addState('BAR');

  machine.setInitialState(machine.BAR);
  equal(machine.nextState, machine.BAR, "Initial state is set to BAR.");
  machine.setInitialState(machine.FOO);
  equal(machine.nextState, machine.FOO, "Initial state is set back to FOO.");

  machine.start();
  throws(function() { machine.setInitialState(machine.BAR); }, "Throws if you try to set the initial state after starting the machine.");
});


test("StateMachine.addState", function () {
  var machine = new ludum.StateMachine("Baz");
  equal(machine.states.length, 0, "Start with no states.");

  machine.addState('FOO');
  equal(machine.states.length, 1,                 "One state added.");
  ok(machine.FOO !== undefined,                   "A constant for the new state has been added to the state machine.");
  equal(machine.states[machine.FOO].name, 'FOO',  "State added with the correct name.");

  ok(machine.states[machine.FOO].enter !== undefined,   "State has a callable 'enter' method.");
  ok(machine.states[machine.FOO].update !== undefined,  "State has a callable 'update' method.");
  ok(machine.states[machine.FOO].leave !== undefined,   "State has a callable 'leave' method.");

  throws(function () { machine.addState('FOO'); },                    "Throws if the state is already defined.");
  throws(function () { machine.addState("invalid state"); },          "Throws if you try to add a state with a name that isn't a valid identifier.");

  machine.addState('BAR', { 'treasures': 10 });
  equal(machine.states.length, 2, "Second state added.");
  ok(machine.BAR !== undefined, "A constant for the new state has been added to the state machine.");
  equal(machine.states[machine.BAR].name, 'BAR', "State added with the correct name.");
  equal(machine.states[machine.BAR].userData.treasures, 10, "User data copied set correctly.");
});


test("StateMachine.isValidState", function () {
  var machine = new ludum.StateMachine("Qux");
  ok(!machine.isValidState(0),  "State 0 is invalid when no states have been added.");

  machine.addState('FOO');
  machine.addState('BAR');
  machine.addState('BAZ');
  ok(machine.isValidState(machine.FOO), "FOO state is valid.");
  ok(machine.isValidState(machine.BAR), "BAR state is valid.");
  ok(machine.isValidState(machine.BAZ), "BAZ state is valid.");
  ok(!machine.isValidState(10),         "Unknown state is invalid.");

  ok(!machine.isValidState(-1),         "State -1 is always invalid.");
});


test("StateMachine.start", function () {
  // Expects two assertions from the function body, plus the one from the
  // 'enter' callback but not the ones from the 'update' or 'leave' callbacks.
  expect(3); 

  var machine = new ludum.StateMachine("Foobar");
  machine.addState("FOO", null, {
    'enter': function () {
      ok(true, "machine.start() calls the enter method of the initial state.");
    },
    'update': function (dt) {
      ok(false, "machine.start() shouldn't call the update method of the initial state.");
    },
    'leave': function () {
      ok(false, "machine.start() shouldn't call the leave method of the initial state.");
    }
  });

  ok(!machine.isValidState(machine.currentState), "Machine starts off in some invalid state.");

  machine.start();

  equal(machine.currentState, machine.FOO, "Machine has moved into the initial state.");
});


test("StateMachine.update", function () {
  // Expects this sequence of calls: FOO.enter(), FOO.update(), FOO.leave(), BAR.enter(), BAR.update().
  expect(5); 

  var sequence = 0;
  var machine = new ludum.StateMachine("Foobar");
  machine.addState("FOO", null, {
    'enter':  function ()   { equal(sequence++, 0, "FOO.enter() called."); },
    'update': function (dt) { equal(sequence++, 1, "FOO.update() called."); machine.changeState(machine.BAR); },
    'leave': function ()    { equal(sequence++, 2, "FOO.leave() called."); }
  });
  machine.addState("BAR", null, {
    'enter':  function ()   { equal(sequence++, 3, "BAR.enter() called."); },
    'update': function (dt) { equal(sequence++, 4, "BAR.update() called."); },
    'leave': function ()    { ok(false, "BAR.leave() shouldn't get called."); }
  });

  machine.start();      // This should result in FOO.enter() being called.
  machine.update(0.1);  // This should FOO.update(), FOO.leave() and BAR.enter().
  machine.update(0.1);  // This should result in only BAR.update() being called.
});


test("StateMachine.changeState", function () {
  var machine = new ludum.StateMachine("Foobar");
  machine.addState("FOO");
  machine.addState("BAR");
  machine.start();

  equal(machine.currentState, machine.FOO,  "Machine enters the FOO state on startup.");

  machine.changeState(machine.BAR);

  equal(machine.currentState, machine.FOO,  "Calling changeState doesn't immediately change the state.");
  equal(machine.nextState, machine.BAR,     "Calling changeState sets the nextState.");

  machine.update(0.1);

  equal(machine.currentState, machine.BAR,  "Machine changes into the BAR state after an update() call.");
});


test("StateMachine.newInstance", function () {
  var machine = new ludum.StateMachine("Foobar");
  machine.addState("FOO");
  machine.addState("BAR");

  var copiedMachine = machine.newInstance();
  equal(copiedMachine.name, machine.name,             "StateMachine name was copied.");
  deepEqual(copiedMachine.userData, machine.userData, "StateMachine userData was copied.");
  equal(copiedMachine.logging, machine.logging,       "StateMachine logging was copied.");
  deepEqual(copiedMachine.states, machine.states,     "StateMachine states were copied.");
  equal(copiedMachine.currentState, -1,               "StateMachine current state was not copied.");
  equal(copiedMachine.nextState, machine.FOO,         "StateMachine next state was not copied.");
});

