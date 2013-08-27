// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

ludum.addSymbols(function(){

  //
  // Constants
  //

  var TEXT = 0;
  var IMAGE = 1;
  var AUDIO = 2;
  var CUSTOM = 3;


  //
  // The Loader class
  //

  function Loader()
  {
    this.count = 0;
    this.succeeded = 0;
    this.failed = 0;
    this.assets = {};
    this.groups = {};
    this.verbose = true;
  }


  Loader.prototype = {};


  Loader.prototype.addGroup = function (name, postprocess)
  {
    if (this.groups[name])
      return;

    if (this.verbose)
      console.log("adding asset group: " + name);

    this.groups[name] = {
      'assets': [],
      'postprocess': postprocess,
      'value': null
    };
  }


  Loader.prototype.addText = function (url, group, postprocess)
  {
    this._addAsset(Loader.prototype.TEXT, url, group, postprocess, null, []);
  }


  Loader.prototype.addImage = function (url, group, postprocess)
  {
    this._addAsset(Loader.prototype.IMAGE, url, group, postprocess, null, []);
  }


  Loader.prototype.addAudio = function (url, group, postprocess)
  {
    this._addAsset(Loader.prototype.AUDIO, url, group, postprocess, null, []);
  }


  // start must be a function which takes the following three arguments:
  // - onLoad(val): a function which the custom loader must call when loading has finished successfully.
  // - onError(val): a function which the custom loader must call when loading fails.
  // - url: the url to load.
  // These will be followed by any additional URLs you provided when calling this function.
  Loader.prototype.addCustom = function (url, group, postprocess, start /*, url, url, ... */)
  {
    var args = Array.prototype.slice.call(arguments);
    this._addAsset(Loader.prototype.CUSTOM, url, group, postprocess, start, args.slice(4));
  }


  Loader.prototype.start = function ()
  {
    if (this.verbose)
      console.log("loading started");

    for (var url in this.assets)
      this._startAsset(url);
  }


  Loader.prototype.finished = function ()
  {
    return (this.succeeded + this.failed) >= this.count;
  }


  Loader.prototype.groupFinished = function (groupName)
  {
    var group = this.groups[groupName];
    if (!group)
      return false;

    for (var i = 0, end = group.assets.length; i < end; ++i) {
      var asset = this.assets[group.assets[i]];
      if (!asset.finished || asset.error)
        return false;
    }

    return true;
  }


  Loader.prototype.fractionComplete = function ()
  {
    if (this.count == 0)
      return 1.0;
    else
      return (this.succeeded + this.failed) / this.count;
  }


  Loader.prototype.fractionFailed = function ()
  {
    if (this.count == 0)
      return 0.0;
    else
      return this.failed / this.count;
  }


  //
  // Loader private methods
  //

  Loader.prototype._addAsset = function (type, url, group, postprocess, start, extraURLs)
  {
    if (this.assets[url])
      return;

    if (this.verbose) {
      var typeStr = [ "text", "image", "audio", "custom" ][type];
      console.log("adding " + typeStr + " asset: " + url);
    }

    this.count++;
    this.assets[url] = {
      'type': type,
      'group': group,
      'postprocess': postprocess,
      'finished': false,
      'value': null,
      'error': null,
      'start': start,
      'extraURLs': extraURLs
    };

    if (group) {
      if (!this.groups[group])
        this.addGroup(group);
      this.groups[group].assets.push(url);
    }
  }


  Loader.prototype._startAsset = function (url)
  {
    var asset = this.assets[url];
    if (!asset)
      return;

    switch (asset.type) {
      case Loader.prototype.TEXT:
        var req = new XMLHttpRequest();
        req.loader = this;
        req.onload = function () { this.loader._onLoaded(url, this.responseText); }
        req.onerror = function () { this.loader._onFailed(url, this.statusText); }
        req.open("GET", url, true);
        req.send();
        break;
      case Loader.prototype.IMAGE:
        var img = new Image();
        img.loader = this;
        img.onload = function () { this.loader._onLoaded(url, this); }
        img.onerror = function () { this.loader._onFailed(url, "image loading failed"); }
        img.src = url;
        break;
      case Loader.prototype.AUDIO:
        var auElem = document.createElement('audio');
        auElem.preload = true;
        auElem.controls = false;
        auElem.loader = this;
        auElem.addEventListener('canplaythrough', function () { this.loader._onLoaded(url, this); });
        auElem.addEventListener('error', function () { this.loader._onLoaded(url, this); });
        auElem.src = url;
        document.body.appendChild(auElem);
        break;
      case Loader.prototype.CUSTOM:
        var theLoader = this;
        var theArgs = [ url, 
                        function (val) { theLoader._onLoaded(url, val); },
                        function (err) { theLoader._onFailed(url, err); } ].concat(asset.extraURLs);
        asset.start.apply(url, theArgs);
        break;
      default:
        break;
    }
  }


  Loader.prototype._onLoaded = function (url, value)
  {
    var asset = this.assets[url];

    asset.req = null;
    asset.finished = true;

    if (asset.postprocess)
      asset.value = asset.postprocess(value);
    else
      asset.value = value;

    if (asset.value) {
      this.succeeded++;
      if (this.verbose)
        console.log("asset " + url + " loaded");
      if (asset.group && this._canPostprocessGroup(asset.group))
        this._postprocessGroup(asset.group);
    }
    else {
      this._onFailed(url, "postprocessing failed");
    }
  }


  Loader.prototype._onFailed = function (url, msg)
  {
    var asset = this.assets[url];
    if (!asset)
      return;

    this.failed++;
    asset.error = msg;
    console.error(msg + " for " + url);
  }


  Loader.prototype._canPostprocessGroup = function (groupName)
  {
    var group = this.groups[groupName];
    return group && group.postprocess && this.groupFinished(groupName);
  }


  Loader.prototype._postprocessGroup = function (groupName)
  {
    var group = this.groups[groupName];
    if (!group || !group.postprocess)
      return;

    var args = [];
    for (var i = 0, end = group.assets.length; i < end; ++i) {
      var asset = this.assets[group.assets[i]];
      args.push(asset.value);
    }

    group.value = group.postprocess.apply(undefined, args);
    if (this.verbose)
      console.log("finished postprocessing " + groupName);
  }


  //
  // Export public functions
  //

  return {
    'Loader': Loader,
  };

}());
