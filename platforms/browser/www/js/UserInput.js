var Phaser = Phaser || {};
var GameApp = GameApp || {};

GameApp.UserInput = function (game, parent, game_state, user_input_data) {
	"use strict";
	Phaser.Plugin.call(this, game, parent);
};

GameApp.UserInput.prototype = Object.create(Phaser.Plugin.prototype);
GameApp.UserInput.prototype.constructor = GameApp.UserInput;

GameApp.UserInput.prototype.init = function (game_state, user_input_data) {
	"use strict";
	var input_type, key, key_code;
	this.game_state = game_state;
	this.user_inputs = {"keydown": {}, "keyup": {}, "keypress": {}};

	// instantiate object with user input data provided
	// each event can be keydown, keyup or keypress
	// separate events by key code
	for (input_type in user_input_data) {
		if (user_input_data.hasOwnProperty(input_type)) {
			for (key in user_input_data[input_type]) {
				if (user_input_data[input_type].hasOwnProperty(key)) {
					key_code = Phaser.Keyboard[key];
					this.user_inputs[input_type][key_code] = user_input_data[input_type][key];
				}
			}
		}
	}

	// add callback for all three events
	this.game.input.keyboard.addCallbacks(this, this.process_input, this.process_input, this.process_input);
};

GameApp.UserInput.prototype.process_input = function (event) {
	"use strict";
	var user_input, callback_data, prefab;
	if (this.user_inputs[event.type] && this.user_inputs[event.type][event.keyCode]) {
		user_input = this.user_inputs[event.type][event.keyCode];
		if (user_input) {
			callback_data = user_input.callback.split(".");
			// identify prefab
			prefab = this.game_state.prefabs[callback_data[0]];
			// call correct method
			prefab[callback_data[1]].apply(prefab, user_input.args);
		}
	}
};