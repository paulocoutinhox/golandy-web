var GameApp = GameApp || {};

GameApp.BombItem = function (game_state, name, position, properties) {
	"use strict";
	GameApp.Item.call(this, game_state, name, position, properties);

	this.MAXIMUM_NUMBER_OF_BOMBS = 5;
};

GameApp.BombItem.prototype = Object.create(GameApp.Item.prototype);
GameApp.BombItem.prototype.constructor = GameApp.BombItem;

GameApp.BombItem.prototype.collect_item = function (item, player) {
	"use strict";
	GameApp.Item.prototype.collect_item.call(this);
	// increases the player number of bombs, limited by a maximum
	player.number_of_bombs = Math.min(player.number_of_bombs + 1, this.MAXIMUM_NUMBER_OF_BOMBS);
};