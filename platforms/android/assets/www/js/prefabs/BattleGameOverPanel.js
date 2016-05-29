var GameApp = GameApp || {};

GameApp.BattleGameOverPanel = function (game_state, name, position, properties) {
	"use strict";
	var movement_animation;
	GameApp.GameOverPanel.call(this, game_state, name, position, properties);

	this.winner = properties.winner;
};

GameApp.BattleGameOverPanel.prototype = Object.create(GameApp.GameOverPanel.prototype);
GameApp.BattleGameOverPanel.prototype.constructor = GameApp.BattleGameOverPanel;

GameApp.BattleGameOverPanel.prototype.show_game_over = function () {
	"use strict";
	var winner_text;
	GameApp.GameOverPanel.prototype.show_game_over.call(this);

	// show the winner if it's in battle mode
	winner_text = this.game_state.game.add.text(this.game_state.world.width / 2, this.game_state.game.world.height * 0.6, "Winner: " + this.winner, this.text_style.winner);
	winner_text.anchor.setTo(0.5);
	this.game_state.groups.hud.add(winner_text);
};