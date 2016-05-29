var GameApp = GameApp || {};

GameApp.Prefab = function (gameState, name, position, properties) {
    "use strict";

    Phaser.Sprite.call(this, gameState.game, position.x, position.y, properties.texture, properties.frame);

    this.gameState = gameState;

    this.name = name;

    //this.game_state.groups[properties.group].add(this); ????
    //this.frame = +properties.frame;

    this.gameState.prefabs[name] = this;
};

GameApp.Prefab.prototype = Object.create(Phaser.Sprite.prototype);
GameApp.Prefab.prototype.constructor = GameApp.Prefab;