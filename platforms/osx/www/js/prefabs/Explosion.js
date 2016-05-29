var GameApp = GameApp || {};

GameApp.Explosion = function (game_state, name, position, properties) {
	"use strict";
	GameApp.Prefab.call(this, game_state, name, position, properties);

	this.anchor.setTo(0.5);

	this.duration = +properties.duration;

	this.game_state.game.physics.arcade.enable(this);
	this.body.immovable = true;

	// create the kill timer with autoDestroy equals false
	this.kill_timer = this.game_state.time.create(false);
	this.kill_timer.add(Phaser.Timer.SECOND * this.duration, this.kill, this);
	this.kill_timer.start();
};

GameApp.Explosion.prototype = Object.create(GameApp.Prefab.prototype);
GameApp.Explosion.prototype.constructor = GameApp.Explosion;

GameApp.Explosion.prototype.reset = function (position_x, position_y) {
	"use strict";
	Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
	// add another kill event
	this.kill_timer.add(Phaser.Timer.SECOND * this.duration, this.kill, this);
};