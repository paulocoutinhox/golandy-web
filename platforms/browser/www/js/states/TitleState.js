var GameApp = GameApp || {};

GameApp.TitleState = function () {
    "use strict";
    Phaser.State.call(this);
};

GameApp.TitleState.prototype = Object.create(Phaser.State.prototype);
GameApp.TitleState.prototype.constructor = GameApp.TitleState;

GameApp.TitleState.prototype.init = function (assetsData) {
    "use strict";
    this.assetsData = assetsData;
};

GameApp.TitleState.prototype.create = function () {
    "use strict";

    GameApp.resetState();

    // background
    var background = game.add.image(game.world.centerX, game.world.centerY, 'stateBackgroundDefault');
    background.anchor.set(0.5);

    // menu
    var menuStartGame = game.add.button(game.world.centerX, game.world.centerY, 'buttonStartGame', function () {
        game.state.start("LoginState", true, false, "", "", "GameState");
    }, this, 1, 0, 1, 1);

    menuStartGame.anchor.set(0.5);
    menuStartGame.position.y += 0;

    /*
     var title_position, title_style, title, menu_position, menu_items, menu_properties, menu_item_name, menu_item, menu;

     // create groups
     this.groups = {};
     this.assetsData.groups.forEach(function (group_name) {
     this.groups[group_name] = this.game.add.group();
     }, this);

     this.prefabs = {};

     game.add.image(game.world.centerX, game.world.centerY, 'background').anchor.set(0.5);
     */

    /*
     // adding title
     title_position = new Phaser.Point(0.5 * this.game.world.width, 0.3 * this.game.world.height);
     title_style = {font: "36px Arial", fill: "#FFF"};
     title = new GameApp.TextPrefab(this, "title", title_position, {text: "GameApp", style: title_style, group: "hud"});
     title.anchor.setTo(0.5);

     // adding menu
     menu_position = new Phaser.Point(0, 0);
     menu_items = [];
     for (menu_item_name in this.level_data.menu_items) {
     if (this.level_data.menu_items.hasOwnProperty(menu_item_name)) {
     menu_item = this.level_data.menu_items[menu_item_name];
     menu_items.push(new GameApp.MenuItem(this, menu_item_name, menu_item.position, menu_item.properties));
     }
     }
     menu_properties = {texture: "", group: "background", menu_items: menu_items};
     menu = new GameApp.Menu(this, "menu", menu_position, menu_properties);
     */
};