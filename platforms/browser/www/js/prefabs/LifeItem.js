var GameApp = GameApp || {};

GameApp.LifeItem = function (game_state, name, position, properties) {
	"use strict";
	GameApp.Item.call(this, game_state, name, position, properties);
};

GameApp.LifeItem.prototype = Object.create(GameApp.Item.prototype);
GameApp.LifeItem.prototype.constructor = GameApp.LifeItem;

GameApp.LifeItem.prototype.collect_item = function (item, player) {
	"use strict";
	GameApp.Item.prototype.collect_item.call(this);
	player.number_of_lives += 1;
};