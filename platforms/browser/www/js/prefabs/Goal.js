var GameApp = GameApp || {};

GameApp.Goal = function (game_state, name, position, properties) {
	"use strict";
	GameApp.Prefab.call(this, game_state, name, position, properties);

	this.anchor.setTo(0.5);
	this.scale.setTo(0.5);

	this.game_state.game.physics.arcade.enable(this);
	this.body.immovable = true;
};

GameApp.Goal.prototype = Object.create(GameApp.Prefab.prototype);
GameApp.Goal.prototype.constructor = GameApp.Goal;

GameApp.Goal.prototype.update = function () {
	"use strict";
	this.game_state.game.physics.arcade.overlap(this, this.game_state.groups.players, this.reach_goal, null, this);
};

GameApp.Goal.prototype.reach_goal = function () {
	"use strict";
	this.game_state.next_level();
};