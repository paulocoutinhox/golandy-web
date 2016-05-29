var GameApp = GameApp || {};

GameApp.Player = function (gameState, name, position, properties) {
    "use strict";

    GameApp.Prefab.call(this, gameState, name, position, properties);

    this.anchor.setTo(0.5);

    //this.animations.add("normal", [1, 2, 3], 10, true);
    //this.animations.add("up", [4, 5, 6], 10, true);
    //this.animations.add("down", [7, 8, 9], 10, true);

    this.gameState.game.physics.arcade.enable(this);
    this.body.setSize(106, 66);

    this.position = new Phaser.Point(0, 0);
};

GameApp.Player.prototype = Object.create(GameApp.Prefab.prototype);
GameApp.Player.prototype.constructor = GameApp.Player;

GameApp.Player.prototype.update = function () {
    "use strict";

};