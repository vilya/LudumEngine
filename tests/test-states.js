module("states");

test("states/StateMachine/constructor", function () {
  var machine = new ludum.StateMachine();
  deepEqual({}, machine.contextDefaults, "No-arg constructor creates empty contextDefaults.");
  equal(0, machine.initialState, "No-arg constructor sets initial state to zero.");

  var contextDefaults = {
    'foo': 1
  };
  machine = new ludum.StateMachine(contextDefaults);
  deepEqual(contextDefaults, machine.contextDefaults, "1-arg constructor sets contextDefaults correctly.");
  equal(0, machine.initialState, "1-arg constructor sets initial state to zero.");

  var exceptionThrown;
  var badContextDefaults = {
    'currentState': 10
  };
  try {
    machine = new ludum.StateMachine(badContextDefaults);
    exceptionThrown = false;
  }
  catch (ex) {
    exceptionThrown = true;
  }
  ok(exceptionThrown, "Exception thrown when contextDefaults contains names that conflict with the ones which get added automatically.");
});
