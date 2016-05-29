var GameApp = GameApp || {};

GameApp.resetState = function () {
	"use strict";
	game.world.setBounds(0, 0, game.width, game.height);
};