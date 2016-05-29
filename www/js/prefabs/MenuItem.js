var GameApp = GameApp || {};

GameApp.MenuItem = function (game_state, name, position, properties) {
	"use strict";
	GameApp.TextPrefab.call(this, game_state, name, position, properties);

	this.anchor.setTo(0.5);

	this.on_selection_animation = this.game_state.game.add.tween(this.scale);
	this.on_selection_animation.to({x: 1.5 * this.scale.x, y: 1.5 * this.scale.y}, 500);
	this.on_selection_animation.to({x: this.scale.x, y: this.scale.y}, 500);
	this.on_selection_animation.repeatAll(-1);

	this.level_file = properties.level_file;
	this.state_name = properties.state_name;
};

GameApp.MenuItem.prototype = Object.create(GameApp.TextPrefab.prototype);
GameApp.MenuItem.prototype.constructor = GameApp.MenuItem;

GameApp.MenuItem.prototype.selection_over = function () {
	"use strict";
	if (this.on_selection_animation.isPaused) {
		this.on_selection_animation.resume();
	} else {
		this.on_selection_animation.start();
	}
};

GameApp.MenuItem.prototype.selection_out = function () {
	"use strict";
	this.on_selection_animation.pause();
};

GameApp.MenuItem.prototype.select = function () {
	"use strict";
	// starts game state
	this.game_state.state.start("BootState", true, false, this.level_file, this.state_name);
};