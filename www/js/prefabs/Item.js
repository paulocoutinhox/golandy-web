var GameApp = GameApp || {};

GameApp.Item = function (game_state, name, position, properties) {
	"use strict";
	GameApp.Prefab.call(this, game_state, name, position, properties);

	this.anchor.setTo(0.5);

	this.game_state.game.physics.arcade.enable(this);
	this.body.immovable = true;

	this.scale.setTo(0.75);
};

GameApp.Item.prototype = Object.create(GameApp.Prefab.prototype);
GameApp.Item.prototype.constructor = GameApp.Item;

GameApp.Item.prototype.update = function () {
	"use strict";
	this.game_state.game.physics.arcade.overlap(this, this.game_state.groups.players, this.collect_item, null, this);
};

GameApp.Item.prototype.collect_item = function () {
	"use strict";
	// by default, an item is destroyed when collected
	this.kill();
};