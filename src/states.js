// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){
 
  //
  // Constants
  //

  var _STANDARD_STATE_VARS = {
    'name': null,
    'transitions': [],
  };

  var _STANDARD_CONTEXT_VARS = {
    'stateMachine': null,
    'currentState': -1,
    'nextState'; -1,
  };


  //
  // StateMachine class
  //
  // This is a static description of a state machine, without any runtime
  // state. It describes the states and how/when to transition between them.
  // The idea is that you create one of these then multiple instances of it,
  // e.g. for NPC logic.
  //
  // Note that the first state you add is assumed to be the starting state,
  // unless you call setInitialState to tell it otherwise.

  function StateMachine(contextDefaults)
  {
    this.states = [];
    this.initialState = 0;
    this.logStateChanges = false;

    if (!contextDefaults)
      this.contextDefaults = {};
    else if (ludum.hasNameClashes(_STANDARD_CONTEXT_VARS, contextDefaults))
      throw new Error('symbols in contextDefaults clash with standard context variable names');
    else
      this.contextDefaults = contextDefaults;
  }


  StateMachine.prototype = {};


  StateMachine.prototype.setContextDefaults(contextDefaults)
  {
    if (!contextDefaults)
      this.contextDefaults = {};
    else if (ludum.hasNameClashes(_STANDARD_CONTEXT_VARS, contextDefaults))
      throw new Error('symbols in contextDefaults clash with standard context variable names');
    else
      this.contextDefaults = contextDefaults;
  }


  StateMachine.prototype.setInitialState(state)
  {
    if (!this._isValidState)
      throw new Error("invalid initial state");
    this.initialState = state;
  }


  // Add a new state. This is a setup function for the state machine. Call it
  // to add all of the possible states for the state machine.
  //
  // This will add a constant to the state machine object which maps the state
  // name to an id, so after calling machine.addState('FOO') you can refer to
  // the state as machine.FOO.
  //
  // The state template can define functions that the state machine will call
  // automatically:
  // - enter(ctx)      is called when transitioning into a state.
  // - update(ctx, dt) is called regularly while in the state; dt is the time
  //                   delta since the last update.
  // - leave(ctx)      is called when transitioning out of a state.
  StateMachine.prototype.addState(name, stateTemplate)
  {
    if (this[name] !== undefined)
      throw new Error("name '" + name + "' is already defined");
    if (!ludum.isValidIdentifier(name))
      throw new Error("invalid state name '" + name + "'");
    if (ludum.hasNameClashes(_STANDARD_STATE_VARS, stateTemplate))
      throw new Error('symbols in stateTemplate clash with standard state variable names');

    var state = {
      'name': name,
      'transitions': [],
    };
    ludum.copySymbols(stateTemplate, state);
    state.enter = state.enter || _noop;
    state.update = state.update || _noop;
    state.leave = state.leave || _noop;

    this[name] = this.states.length;
    this.states.push(state);
  }


  // Add a transition from one state to another. The transition has a condition
  // which we check to determine whether we should follow it or not.
  //
  // 'condition(ctx)' is a callable function which returns true when the
  // condition is met. This will be called very frequently, so it should be as
  // fast as possible.
  //
  // The order in which you add transitions to the fromState defines their
  // precedence. We iterate over them in the order they're added and follow the
  // first one whose condition call returns true.
  StateMachine.prototype.addTransition(fromState, toState, condition)
  {
    if (!this._isValidState(fromState))
      throw new Error("invalid fromState");
    if (!this._isValidState(toState))
      throw new Error("invalid toState");
    if (fromState == toState)
      throw new Error("cannot add self-transitions");

    var transition = {
      'condition': condition,
      'toState': toState
    };
    this.states[fromState].transitions.push(transition);
  }


  StateMachine.prototype.addAutomaticTransition(fromState, toState)
  {
    this.addTransition(fromState, toState, _true);
  }


  // Create a new executable instance of this state machine.
  StateMachine.prototype.newContext()
  {
    var ctx = {};
    ctx.stateMachine = this;
    ctx.currentState = -1;
    ctx.nextState = this.initialState;
    if (this.contextDefaults)
      ludum.copySymbols(this.contextDefaults, ctx);

    return context;
  }


  StateMachine.prototype.isValidState = function (state)
  {
    return state >= 0 && state < this.states.length;
  }


  //
  // StateMachineContext class
  //

  function StateMachineContext(stateMachine)
  {
    this.stateMachine = stateMachine;
    this.currentState = -1;
    this.nextState = stateMachine.initialState;

    if (this.stateMachine.contextDefaults)
      ludum.copySymbols(this.stateMachine.contextDefaults, this);
  }


  StateMachineContext.prototype = {};


  StateMachineContext.prototype.update(dt)
  {
    // If there's a current state, update it (the only time there isn't a
    // current state is when the context hasn't started yet).
    if (this.currentState != -1)
      this.stateMachine.states[this.currentState].update(this, dt);

    // Check whether we're transitioning.
    if (this.nextState == this.currentState) {
      var stateObj = this.stateMachine.states[this.currentState];
      for (var i = 0, end = stateObj.transitions.length; i < end && this.nextState == this.currentState; ++i) {
        if (stateObj.transitions[i].condition(this))
          this.nextState = stateObj.transitions[i].toState;
      }
    }

    // If we are transitioning.
    if (this.nextState != this.currentState) {
      // Leave the current state, if there is one.
      if (this.currentState != -1) {
        var oldStateObj = this.stateMachine.states[this.currentState];
        if (this.stateMachine.logStateChanges)
          console.log("leaving state '" + oldStateObj.name + "'");
        oldStateObj.leave(this);
      }

      // Change the current state.
      this.currentState = this.nextState;

      // Enter the new state.
      var newStateObj = this.stateMachine.states[this.currentState];
      newStateObj.enter(this);
    }
  }


  // Call this from inside the update(ctx) method for a state to change the
  // context into a new state. Note that the state change doesn't happen until
  // after the current update call is finished. If you change the state this
  // way it will take precedence over any transitions you've added via the
  // addTransition method.
  StateMachineContext.prototype.changeState(toState)
  {
    if (!ctx.stateMachine._isValidState(toState))
      throw new Error("attempting to change to invalid state ('" + toState + "')");
    ctx.nextState = toState;
  }


  //
  // Helper functions
  //

  function _noop()
  {
    // Do nothing.
  }


  function _true()
  {
    return true;
  }


  //
  // Public symbols.
  //

  return {
    'StateMachine': StateMachine
  };
}());
