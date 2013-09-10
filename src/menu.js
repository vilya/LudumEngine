// Include base.js before this file.
if (!ludum)
  throw Error("you must include base.js before this file");

// Include math.js before this file.
ludum.require("wrap");

ludum.addSymbols(function(){
 
  //
  // Menu class
  //

  function Menu(rootItem)
  {
    this.root = rootItem;
    this.selection = [0];
  }


  Menu.prototype = {};


  Menu.prototype.selectedIndex = function ()
  {
    return this.selection[this.selection.length - 1];
  }


  Menu.prototype.selectedItem = function ()
  {
    var item = this.root;
    for (var i = 0, end = this.selection.length; i < end; ++i) {
      var sel = this.selection[i];
      item = item.children[sel];
    }
    return item;
  }


  Menu.prototype.selectedMenu = function ()
  {
    var item = this.root;
    for (var i = 0, end = this.selection.length - 1; i < end; ++i) {
      var sel = this.selection[i];
      item = item.children[sel];
    }
    return item;
  }


  Menu.prototype.moveSelectedIndex = function (offset)
  {
    var menu = this.selectedMenu();
    var index = ludum.wrap(this.selectedIndex() + offset, menu.children.length);
    this.selection[this.selection.length - 1] = index;
  }


  Menu.prototype.enterSubmenu = function ()
  {
    var item = this.selectedItem();
    if (item.children.length > 0)
      this.selection.push(0);
  }


  Menu.prototype.leaveSubmenu = function ()
  {
    if (this.selection.length > 1)
      this.selection.pop();
  }


  //
  // MenuItem class
  //

  function MenuItem(label, action /*, child1, child2, ... */)
  {
    this.label = label;
    this.action = action;
    if (arguments.length > 2)
      this.children = Array.prototype.slice.call(arguments, 2);
    else
      this.children = [];
  }


  MenuItem.prototype = {};


  //
  // Public symbols.
  //

  return {
    'Menu': Menu,
    'MenuItem': MenuItem
  };

}());
