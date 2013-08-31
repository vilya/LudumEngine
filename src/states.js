// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){
 
  //
  // StateMachine class
  //
  // This is an executable state machine. If you need multiple instances of the
  // same state machine (e.g. for NPC behaviour), you should set up a clean
  // instance then manufacture new instances by cloning from it.
  //
  // Note that the first state you add is assumed to be the starting state,
  // unless you call setInitialState to tell it otherwise.

  function StateMachine(name, userData)
  {
    this.name = name;
    this.userData = userData;
    this.logging = false;

    this.states = [];
    this.currentState = -1;
    this.nextState = 0;
  }


  StateMachine.prototype = {};


  StateMachine.prototype.setInitialState = function (state)
  {
    if (!this.isValidState(state))
      throw new Error("invalid initial state");
    else if (this.currentState != -1)
      throw new Error("state machine has already started");
    this.nextState = state;
  };


  // Add a new state. This is a setup function for the state machine. Call it
  // repeatedly until you've added all of the possible states for the state
  // machine.
  //
  // This will add a constant to the state machine object which maps the state
  // name to an id, so after calling machine.addState('FOO') you can refer to
  // the state as machine.FOO.
  //
  // The state template can define functions that the state machine will call
  // automatically:
  //
  // - enter()      is called when transitioning into a state.
  // - update(dt)   is called regularly while in the state; dt is the time
  //                   delta since the last update.
  // - leave()      is called when transitioning out of a state.
  StateMachine.prototype.addState = function (name, kwargs)
  {
    if (this[name] !== undefined)
      throw new Error("state '" + name + "' already exists");
    if (!ludum.isValidIdentifier(name))
      throw new Error("'" + name + "' is not a valid identifier");

    var state = {};
    state.name = name;
    if (kwargs) {
      state.enter = kwargs.enter || _noop;
      state.update = kwargs.update || _noop;
      state.leave = kwargs.leave || _noop;
    }
    else {
      state.enter = _noop;
      state.update = _noop;
      state.leave = _noop;
    }

    this[name] = this.states.length;
    this.states.push(state);
  };


  StateMachine.prototype.isValidState = function (state)
  {
    return state >= 0 && state < this.states.length;
  };


  StateMachine.prototype.start = function ()
  {
    // Change the current state.
    this.currentState = this.nextState;

    // Enter the new state.
    var stateObj = this.states[this.currentState];
    if (this.logging)
      console.log(this.name + " entering start state '" + stateObj.name + "'");
    stateObj.enter();
  };


  StateMachine.prototype.update = function (dt)
  {
    var stateObj = this.states[this.currentState];

    // Update the current state. This may set the nextState attribute as a
    // side-effect.
    stateObj.update(dt);

    // If the update caused a transition, handle that now.
    if (this.nextState != this.currentState) {
      // Leave the current state.
      var oldStateObj = this.states[this.currentState];
      if (this.logging)
        console.log(this.name + " leaving state '" + oldStateObj.name + "'");
      oldStateObj.leave();

      // Change the current state.
      this.currentState = this.nextState;

      // Enter the new state.
      var newStateObj = this.states[this.currentState];
      if (this.logging)
        console.log(this.name + " entering state '" + newStateObj.name + "'");
      newStateObj.enter();
    }
  };


  // Call this from inside the update() method for a state to change the
  // context into a new state.
  //
  // Note that the state change doesn't happen until after the current update
  // call is finished, so if you call this multiple times only the last one
  // will have any effect.
  StateMachine.prototype.changeState = function (toState)
  {
    if (!this.isValidState(toState)) {
      var currStateObj = this.states[this.currentState];
      throw new Error(this.name + " attempting to change from state '" + currStateObj.name + "' to an invalid state ('" + toState + "')");
    }
    this.nextState = toState;
  };


  // Create a new instance of the state machine by copying the setup from this.
  StateMachine.prototype.newInstance = function ()
  {
    var copiedUserData = (this.userData ? JSON.parse(JSON.stringify(this.userData)) : this.userData);

    var copiedMachine = new StateMachine(this.name, copiedUserData);
    copiedMachine.logging = this.logging;

    for (var i = 0, endI = this.states.length; i < endI; ++i) {
      var srcState = this.states[i];
      copiedMachine.addState(srcState.name, {
        'enter': srcState.enter,
        'update': srcState.update,
        'leave': srcState.leave
      });
    }

    return copiedMachine;
  };


  //
  // Helper functions
  //

  function _noop()
  {
    // Do nothing.
  }


  //
  // Public symbols.
  //

  return {
    'StateMachine': StateMachine
  };
}());
