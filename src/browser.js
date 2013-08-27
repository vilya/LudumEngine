// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){

  //
  // Install browser shims
  //

  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 1000/60);
           };
  })();


  //
  // Functions
  //

  function browserInfo()
  {
    return {
      'canvas': _hasCanvas(),
      'webGL': _hasWebGL(),
      'workers': _hasWebWorkers(),
      'fileAPI': _hasFileAPI(),
      'pointerLock': _hasPointerLock()
    };
  }


  function showMessage(msgHTML, parentElem, kwargs)
  {
    var targetElem = parentElem || document.body;
    var elem = document.createElement('div');

    if (kwargs['id'] !== undefined)
      elem['id'] = kwargs['id'];
    if (kwargs['class'] !== undefined)
      elem['class'] = kwargs['class'];

    elem.style.width = targetElem.innerWidth;
    elem.innerHTML = msgHTML;
    
    targetElem.appendChild(elem);
  }


  //
  // Private functions
  //

  function _hasCanvas()
  {
    return window.CanvasRenderingContext2D ? true : false;
  }


  function _hasWebGL()
  {
    if (!window.WebGLRenderingContext)
      return false;

    var contextNames = [ 'webgl', 'experimental-webgl' ];
    for (var i = 0, end = contextNames.length; i < end; ++i) {
      try {
        // If this line fails it will throw an exception, skipping the return
        // statement. If it passes, then we have webgl support (hooray!).
        document.createElement('canvas').getContext(contextNames[i]);
        return true;
      }
      catch (ex) {
      }
    }
    return false;
  }


  function _hasWebWorkers()
  {
    return window.Worker ? true : false;
  }


  function _hasFileAPI()
  {
    return window.File && window.FileReader && window.FileList && window.Blob;
  }


  function _hasPointerLock()
  {
    return false; // TODO
  }


  //
  // Export public functions
  //

  return {
    'browserInfo': browserInfo,
    'showMessage': showMessage
  };

}());
