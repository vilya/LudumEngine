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


  // Set the state that this state machine will enter when its 'start()' method
  // gets called. The initial state defaults to 0, which will be whatever state
  // you added first; you only need to call this if you want the starting state
  // to be something other than 0.
  //
  // You can't set the initial state to a state that you haven't added yet,
  // because we check to ensure that you're passing in a valid state index. As
  // a general rule you should only after you've finished adding all the states.
  //
  // It is not valid to call this method on a state machine after its 'start()'
  // method has been called. Doing so will cause an exception.
  StateMachine.prototype.setInitialState = function (state)
  {
    if (!this.isValidState(state))
      throw new Error("invalid initial state");
    else if (this.currentState != -1)
      throw new Error("state machine has already started");
    this.nextState = state;
  }


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
  }


  // Check whether the integer 'state' is a valid state index.
  StateMachine.prototype.isValidState = function (state)
  {
    return state >= 0 && state < this.states.length;
  }


  // Begin executing the state machine.
  //
  // This changes the state machine into its initial state. It calls the
  // 'enter()' function for the initial state, if any, but does not call
  // 'update()'.
  //
  // You must call this on your state machine instance before making any
  // update() calls on it.
  //
  // Prior to this call the 'currentState' member will be some invalid value;
  // the 'nextState' member will hold the index of the initial state.
  //
  // After this method has been called the userData member may have been
  // changed from its initial state. If so any calls to newInstance() will
  // create a new state machine with a copy of the *modified* userData. If this
  // is not what you want, make sure you call newInstance() *before* this
  // method.
  StateMachine.prototype.start = function ()
  {
    // Change the current state.
    this.currentState = this.nextState;

    // Enter the new state.
    var stateObj = this.states[this.currentState];
    if (this.logging)
      console.log(this.name + " entering start state '" + stateObj.name + "'");
    stateObj.enter();
  }


  // Update the state machine. This calls the 'update()' function for the
  // current state and handles any resulting request for a state change.
  //
  // A state change is signalled by the 'nextState' member having a different
  // value to the 'currentState' member. Any state change is handled after the
  // 'update()' call completes, as follows:
  // - Call the 'leave()' function for the current state.
  // - Set the 'currentState' member to the 'nextState' value.
  // - Call the 'enter' function for the new state.
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
  }


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
  }


  // Create a new instance of the state machine by copying the setup from this.
  //
  // The new state machine will have the same set of states and state methods
  // as the instance it was copied from. It will be left unstarted, so you
  // must call the 'start()' method yourself, regardless of whether the
  // instance it was copied from had been started.
  //
  // The 'userData' member will be copied over verbatim, even if it has changed
  // from its initial values. This will probably not be what you want, so for
  // any state machine that you expect to have multiple instances of, you should
  // create a clean instance which you never call start() on and create all
  // other instances by copying from it.
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
  }


  //
  // Helper functions
  //

  // Helper function which does nothing. We use this as a stub for undefined
  // state functions, so that we don't need to have checks before every call to
  // one of them.
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
