var GameApp = GameApp || {};

GameApp.Lives = function (game_state, name, position, properties) {
	"use strict";
	var lives_text_position, lives_text_style, lives_text_properties;
	GameApp.Prefab.call(this, game_state, name, position, properties);

	this.player = properties.player;

	this.fixedToCamera = true;

	this.anchor.setTo(0.5);
	this.scale.setTo(0.6);

	// create a text prefab to show the number of lives
	lives_text_position = new Phaser.Point(this.position.x - 2, this.position.y + 5);
	lives_text_style = {font: "10px Arial", fill: "#fff"};
	lives_text_properties = {group: "hud", text: this.number_of_lives, style: lives_text_style};
	this.lives_text = new GameApp.TextPrefab(this.game_state, "lives_text", lives_text_position, lives_text_properties);
	this.lives_text.anchor.setTo(0.5);
};

GameApp.Lives.prototype = Object.create(GameApp.Prefab.prototype);
GameApp.Lives.prototype.constructor = GameApp.Lives;

GameApp.Lives.prototype.update = function () {
	"use strict";
	// update to show current number of lives
	this.lives_text.text = this.game_state.prefabs[this.player].number_of_lives;
};