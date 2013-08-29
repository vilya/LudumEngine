module("states");

test("StateMachine constructor", function () {
  var machine = new ludum.StateMachine();
  deepEqual(machine.contextDefaults, {}, "No-arg constructor creates empty contextDefaults.");
  equal(machine.initialState, 0, "No-arg constructor sets initial state to zero.");

  var contextDefaults = { 'foo': 'bar' };
  machine = new ludum.StateMachine(contextDefaults);
  deepEqual(machine.contextDefaults, contextDefaults, "1-arg constructor sets contextDefaults correctly.");
  equal(machine.initialState, 0, "1-arg constructor sets initial state to zero.");

  var badContextDefaults = { 'currentState': 10 };
  throws(function () { new ludum.StateMachine(badContextDefaults); }, "Throws when contextDefaults has a name clash with our internal state-tracking symbols.");
});


test("StateMachine.setContextDefaults", function () {
  var machine = new ludum.StateMachine();
  deepEqual(machine.contextDefaults, {}, "contextDefaults are an empty object before the setContextDefaults call.");

  var contextDefaults = { 'foo': 'bar' };
  machine.setContextDefaults(contextDefaults);
  deepEqual(machine.contextDefaults, contextDefaults, "contextDefaults are set correctly when they don't contain name clashes.");

  var badContextDefaults = { 'currentState': 10 };
  throws(function () { machine.setContextDefaults(badContextDefaults); }, "Throws when contextDefaults has a name clash with our internal state-tracking symbols.");
});


test("StateMachine.setInitialState", function () {
  var machine = new ludum.StateMachine();
  equal(machine.initialState, 0, "Initial state defaults to zero.");
  throws(function () { machine.setInitialState(1); }, "Throws if you try to set the state to a number which hasn't been added yet.");
  throws(function () { machine.setInitialState(0); }, "Throws if you try to set the state to zero, even if it's already zero.");

  machine.addState('FOO');
  machine.addState('BAR');

  machine.setInitialState(machine.BAR);
  equal(machine.initialState, machine.BAR, "Initial state is set to BAR.");
  machine.setInitialState(machine.FOO);
  equal(machine.initialState, machine.FOO, "Initial state is set back to FOO.");
});


test("StateMachine.addState", function () {
  var machine = new ludum.StateMachine();
  equal(machine.states.length, 0, "Start with no states.");

  machine.addState('FOO');
  equal(machine.states.length, 1, "One state added.");
  ok(machine.FOO !== undefined, "A constant for the new state has been added to the state machine.");
  equal(machine.states[machine.FOO].name, 'FOO', "State added with the correct name.");
  deepEqual(machine.states[machine.FOO].transitions, [], "State added with empty list of transitions.");

  throws(function () { machine.addState('FOO'); }, "Throws if the state is already defined.");
  throws(function () { machine.addState("invalid state"); }, "Throws if you try to add a state with a name that isn't a valid identifier.");
  throws(function () { machine.addState("BAR", { 'name': 'bar' }); }, "Throws if the stateTemplate contains called 'name' or 'transitions'.");

  machine.addState('BAR', { 'treasures': 10 });
  equal(machine.states.length, 2, "Second state added.");
  ok(machine.BAR !== undefined, "A constant for the new state has been added to the state machine.");
  equal(machine.states[machine.BAR].name, 'BAR', "State added with the correct name.");
  equal(machine.states[machine.BAR].treasures, 10, "Extra variable copied from stateTemplate.");
});
