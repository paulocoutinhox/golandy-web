var GameApp = GameApp || {};

GameApp.GameOverPanel = function (game_state, name, position, properties) {
	"use strict";
	var movement_animation;
	GameApp.Prefab.call(this, game_state, name, position, properties);

	this.text_style = properties.text_style;

	this.alpha = 0.5;
	// create a tween animation to show the game over panel
	movement_animation = this.game_state.game.add.tween(this);
	movement_animation.to({y: 0}, properties.animation_time);
	movement_animation.onComplete.add(this.show_game_over, this);
	movement_animation.start();
};

GameApp.GameOverPanel.prototype = Object.create(GameApp.Prefab.prototype);
GameApp.GameOverPanel.prototype.constructor = GameApp.GameOverPanel;

GameApp.GameOverPanel.prototype.show_game_over = function () {
	"use strict";
	var game_over_text;
	// add game over text
	game_over_text = this.game_state.game.add.text(this.game_state.game.world.width / 2, this.game_state.game.world.height * 0.4, "Game Over", this.text_style.game_over);
	game_over_text.anchor.setTo(0.5);
	this.game_state.groups.hud.add(game_over_text);

	// add event to restart level
	this.inputEnabled = true;
	this.events.onInputDown.add(this.game_state.game_over, this.game_state);
};