var GameApp = GameApp || {};

GameApp.GameState = function () {
	"use strict";
	Phaser.State.call(this);
};

GameApp.GameState.prototype = Object.create(Phaser.State.prototype);
GameApp.GameState.prototype.constructor = GameApp.GameState;

GameApp.GameState.prototype.init = function (assetsData) {
	"use strict";

	this.assetsData = assetsData;
	this.resetStateData();
};

GameApp.GameState.prototype.preload = function () {
	"use strict";
};

GameApp.GameState.prototype.resetStateData = function () {
	"use strict";

	game.world.removeAll(true);

	// general
	this.online = false;

	// player
	this.players = {};
	this.player = null;

	// bombs
	this.bombs = {};

	// ping
	this.pinging = false;
	this.pingTimerDelay = 2000;
	this.pingChangeMovementDelay = false;
	this.pingTimer = null;

	// groups
	this.groups = {
		'background': game.add.group(),
		'mapFloor': game.add.group(),
		'mapObject': game.add.group(),
		'underPlayer': game.add.group(),
		'object': game.add.group(),
		'bomb': game.add.group(),
		'player': game.add.group(),
		'playerInfo': game.add.group(),
		'overPlayer': game.add.group(),
		'mapRoof': game.add.group(),
		'hud': game.add.group()
	};

	// gui
	this.connectionState = null;
	this.buttonAddBomb = null;

	// map
	this.map = null;
	this.floorLayer = null;

	// background
	this.backgroundTileSprite = null;

	GameApp.resetState();
};

GameApp.GameState.prototype.shutdown = function () {
	"use strict";
	this.resetStateData();
};

GameApp.GameState.prototype.sendPingCommand = function () {
	"use strict";

	if (this.pinging) {
		this.enqueueNewPingCommand();
		return;
	}

	if (!this.player) {
		return;
	}

	this.player.lastPingCommandTime = new Date();

	var message = JSON.stringify({
		type: "ping"
	});

	GameApp.data.socket.send(message);
};

GameApp.GameState.prototype.updateConnectionState = function () {
	"use strict";

	if (!this.player) {
		return;
	}

	var level5 = this.player.movementDelay;
	var level4 = this.player.movementDelay + ((this.player.movementDelay * 10) / 100);
	var level3 = this.player.movementDelay + ((this.player.movementDelay * 20) / 100);
	var level2 = this.player.movementDelay + ((this.player.movementDelay * 30) / 100);

	if (this.player.latency < level5) {
		this.connectionState.play("5");
	} else if (this.player.latency < level4) {
		this.connectionState.play("4");
	} else if (this.player.latency < level3) {
		this.connectionState.play("3");
	} else if (this.player.latency < level2) {
		this.connectionState.play("2");
	} else {
		this.connectionState.play("1");
	}
};

GameApp.GameState.prototype.enqueueNewPingCommand = function () {
	"use strict";

	clearTimeout(this.pingTimer);

	var context = this;

	this.pingTimer = setTimeout(function () {
		context.sendPingCommand();
	}, this.pingTimerDelay);
};

GameApp.GameState.prototype.create = function () {
	"use strict";

	this.input.maxPointers = 1;

	game.stage.backgroundColor = '#2d2d2d';

	var context = this;

	GameApp.data.socket.onclose = function () {
		GameApp.data.online = false;
		game.state.start("LoadingState", true, false, null, null, "TitleState");
	};

	GameApp.data.socket.onerror = function () {
		GameApp.data.online = false;
		game.state.start("LoadingState", true, false, null, null, "TitleState");
	};

	GameApp.data.socket.onmessage = function (message) {
		var m = JSON.parse(message.data);

		if (m.type) {
			switch (m.type) {
				case "pong":
					if (context.player) {
						var currentMS = new Date().getTime();
						var lastPingCommandtimeMS = context.player.lastPingCommandTime.getTime();
						var ms = currentMS - lastPingCommandtimeMS;
						context.player.latency = ms;

						if (context.pingChangeMovementDelay) {
							if (context.player.latency > context.player.movementDelay) {
								context.player.movementDelayDiff = (context.player.latency - context.player.movementDelay);
							} else {
								context.player.movementDelayDiff = 0;
							}
						} else {
							context.player.movementDelayDiff = 0;
						}
					}

					context.updateConnectionState();
					context.pinging = false;
					context.enqueueNewPingCommand();
					break;

				case "player-data":
					if (context.map == null) {
						context.map = game.add.tilemap(m.map);
						//context.map.priorityID = 0;

						context.map.addTilesetImage('meta', 'meta');
						context.map.addTilesetImage('tileset1', 'tileset1');

						context.floorLayer = context.map.createLayer('Floor', null, null, context.groups.mapFloor);

						var layerWidth = context.floorLayer.layer.widthInPixels * context.floorLayer.scale.x;
						var layerHeight = context.floorLayer.layer.heightInPixels * context.floorLayer.scale.y;

						game.world.setBounds(-(layerWidth / 2), -(layerHeight / 2), layerWidth * 2, layerHeight * 2);

						context.floorLayer.resize(game.width, game.height);

						// console.log("MAPA:");
						// console.log(layerWidth);
						// console.log(layerHeight);

						// the new camera dont show it, so we will disable for now
						/*
                        var bgX = -(GameApp.CANVAS_WIDTH);
                        var bgY = -(GameApp.CANVAS_HEIGHT);
                        var bgWidth = GameApp.CANVAS_WIDTH * 3;
                        var bgHeight = GameApp.CANVAS_HEIGHT * 4;
                        context.backgroundTileSprite = game.add.tileSprite(bgX, bgY, bgWidth, bgHeight, 'background003');
                        context.groups.background.add(context.backgroundTileSprite);
						*/
					}

					context.player = context.spawn(m);
					game.camera.follow(context.player.sprite);
					context.sendPingCommand();

					game.physics.enable(context.player.sprite, Phaser.Physics.ARCADE);

					context.connectionState = context.groups.hud.create(0, 10, 'connectionState');
					context.connectionState.x = game.camera.width - context.connectionState.width - 10;
					context.connectionState.fixedToCamera = true;
					context.connectionState.animations.add('1', [0], 1);
					context.connectionState.animations.add('2', [1], 1);
					context.connectionState.animations.add('3', [2], 1);
					context.connectionState.animations.add('4', [3], 1);
					context.connectionState.animations.add('5', [4], 1);
					context.connectionState.play('5');

					var buttonAddBombW = game.cache.getImage('buttonAddBomb').width;
					var buttonAddBombH = game.cache.getImage('buttonAddBomb').height;
					var buttonAddBombX = game.camera.x;
					var buttonAddBombY = game.camera.height - buttonAddBombH;

					context.buttonAddBomb = game.add.sprite(buttonAddBombX, buttonAddBombY, 'buttonAddBomb');
					context.buttonAddBomb.inputEnabled = true;
					context.buttonAddBomb.events.onInputDown.add(function () {
						if (context.playerCanAddBomb()) {
							context.player.lastAddBombTime = new Date();
							context.sendAddBombCommand(context.player.position.x, context.player.position.y);
						}
					});
					context.buttonAddBomb.useHandCursor = true;

					context.buttonAddBomb.fixedToCamera = true;
					context.buttonAddBomb.priorityID = 0;
					context.groups.hud.add(context.buttonAddBomb);

					break;

				case "player-added":
					if (context.players) {
						context.players[m.id] = context.spawn(m);
					}
					break;

				case "bomb-added":
					if (context.bombs) {
						context.bombs[m.id] = context.spawnBomb(m);

						if (GameApp.DEBUG) {
							console.log("New bomb added: " + m.id + " - X: " + m.x + " - Y: " + m.y);
						}
					} else {
						if (GameApp.DEBUG) {
							console.log("Bomb list is not defined");
						}
					}
					break;

				case "bomb-fired":
					if (context.bombs) {
						var bomb = context.bombs[m.id];

						if (bomb) {
							if (GameApp.DEBUG) {
								console.log("New bomb fired: " + m.id + " - X: " + m.x + " - Y: " + m.y);
							}

							context.spawnBombFired(bomb);
							bomb.sprite.destroy();
							bomb = null;
						} else {
							if (GameApp.DEBUG) {
								console.log("Bomb was not found to be fired: " + m.id);
							}
						}
					} else {
						if (GameApp.DEBUG) {
							console.log("No local bombs to be fired");
						}
					}
					break;

				case "player-removed":
				case "player-dead":
					if (context.players) {
						var player = context.players[m.id];

						if (player) {
							context.players[m.id].sprite.label.destroy();
							context.players[m.id].sprite.destroy();
							context.players[m.id] = null;
						}
					}
					break;

				case "move":
					context.updatePosition(m);
					break;

				case "move-ok":
					if (context.player) {
						context.player.lastMovementOK = true;
					}
					break;

				case "move-invalid":
					if (context.player) {
						context.playerCancelMovement();

						context.player.lastMovementOK = true;

						context.player.position.x = m.x;
						context.player.position.y = m.y;
						context.player.direction = m.direction;

						context.playerSetDirection(context.player, m.direction);
						context.playerSetPosition(context.player, context.player.position.x, context.player.position.y, true);
					}
					break;

				case "dead":
					context.resetStateData();

					$.magnificPopup.open({
						items: {
							src: '<div class="modalContainer" onclick="$.magnificPopup.close();"><h1>You lose!<br /><br />Tap here to try again :)</h1></div>',
							type: 'inline',
							modal: true
						},
						callbacks: {
							close: function () {
								game.state.start("LoadingState", true, false, null, null, "LoginState");
							}
						}
					});

					break;
			}
		}
	};

	this.sendGameDataCommand();
};

GameApp.GameState.prototype.playerMoveToLeft = function () {
	"use strict";

	var playerDestinationX = this.player.position.x - 1;
	var playerDestinationY = this.player.position.y;

	if (playerDestinationX < 0) {
		this.player.isMoving = false;
		return;
	}

	this.player.lastMovementOK = false;

	this.sendPositionCommand(playerDestinationX, playerDestinationY, 4);

	this.player.sprite.animations.play('left');
	this.playerSetDirection(this.player, 4);
	this.playerSetPosition(this.player, playerDestinationX, playerDestinationY, false);
};

GameApp.GameState.prototype.playerMoveToRight = function () {
	"use strict";

	var playerDestinationX = this.player.position.x + 1;
	var playerDestinationY = this.player.position.y;

	if (playerDestinationX > (this.map.width - 1)) {
		this.player.isMoving = false;
		return;
	}

	this.player.lastMovementOK = false;

	this.sendPositionCommand(playerDestinationX, playerDestinationY, 2);

	this.player.sprite.animations.play('right');
	this.playerSetDirection(this.player, 2);
	this.playerSetPosition(this.player, playerDestinationX, playerDestinationY, false);

};

GameApp.GameState.prototype.playerMoveToUp = function () {
	"use strict";

	var playerDestinationX = this.player.position.x;
	var playerDestinationY = this.player.position.y - 1;

	if (playerDestinationY < 0) {
		this.player.isMoving = false;
		return;
	}

	this.player.lastMovementOK = false;

	this.sendPositionCommand(playerDestinationX, playerDestinationY, 1);

	this.player.sprite.animations.play('up');
	this.playerSetDirection(this.player, 1);
	this.playerSetPosition(this.player, playerDestinationX, playerDestinationY, false);
};

GameApp.GameState.prototype.playerMoveToDown = function () {
	"use strict";

	var playerDestinationX = this.player.position.x;
	var playerDestinationY = this.player.position.y + 1;

	if (playerDestinationY > (this.map.height - 1)) {
		this.player.isMoving = false;
		return;
	}

	this.player.lastMovementOK = false;

	this.sendPositionCommand(playerDestinationX, playerDestinationY, 3);

	this.player.sprite.animations.play('down');
	this.playerSetDirection(this.player, 3);
	this.playerSetPosition(this.player, playerDestinationX, playerDestinationY, false);
};

GameApp.GameState.prototype.update = function () {
	"use strict";

	if (!GameApp.data.online) {
		return;
	}

	if (!this.player) {
		return;
	}

	if (this.backgroundTileSprite) {
		this.backgroundTileSprite.autoScroll(4, 4);
	}

	// this code is not working on newer versions
	/*
    var cameraX = Math.round((this.player.sprite.x) - (game.camera.width / 2));
    var cameraY = Math.round((this.player.sprite.y) - (game.camera.height / 2));

    if (cameraX != game.camera.X || cameraY != game.camera.Y) {
        game.camera.bounds = new Phaser.Rectangle(this.player.sprite.x + (game.camera.width / 2), this.player.sprite.y + (game.camera.height / 2), 0, 0);
        game.camera.x = cameraX;
        game.camera.y = cameraY;
    }
	*/

	if (this.player.isMoving) {
		// vale a pena notificar o usuário disso?
	} else if (this.playerCanMove()) {
		if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			this.player.isMoving = true;
			this.playerMoveToLeft();
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			this.player.isMoving = true;
			this.playerMoveToRight();
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
			this.player.isMoving = true;
			this.playerMoveToUp();
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
			this.player.isMoving = true;
			this.playerMoveToDown();
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			game.state.start("LoadingState", true, false, null, null, "TitleState");
		} else if (game.input.activePointer.isDown) {
			if (Phaser.Rectangle.contains(this.buttonAddBomb, game.input.activePointer.worldX, game.input.activePointer.worldY)) {
				return;
			}

			var currentTile = this.map.getTile(this.floorLayer.getTileX(game.input.activePointer.worldX), this.floorLayer.getTileY(game.input.activePointer.worldY));

			if (currentTile) {
				this.playerCancelMovement();
				this.player.isMoving = true;

				this.addSpawnEffect({
					x: currentTile.x * GameApp.TILE_SIZE,
					y: currentTile.y * GameApp.TILE_SIZE,
					width: 0
				}, 5);

				if (this.player.movingTimer != null) {
					clearTimeout(this.player.movingTimer);
				}

				this.player.destination.x = currentTile.x;
				this.player.destination.y = currentTile.y;

				this.playerMoveToDestination();
			}
		}
	}

	if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
		if (this.playerCanAddBomb()) {
			this.player.lastAddBombTime = new Date();
			this.sendAddBombCommand(this.player.position.x, this.player.position.y);
		}
	}
};

GameApp.GameState.prototype.spawn = function (m) {
	"use strict";

	var label = m.id.match(/(^\w*)-/i)[1];

	var newPlayer = {
		position: {
			x: m.x,
			y: m.y
		},
		charType: m.charType,
		direction: m.direction,
		movementDelay: m.movementDelay,
		sprite: null,
		nameStyle: { font: "12px Arial", fill: "#ffffff" },
		isMoving: false,
		isMovingTweenAlive: false,
		destination: { x: 0, y: 0 },
		autoMovingTimer: null,
		movingTimer: null,
		movingTween: null,
		lastMovementTime: new Date(),
		lastPingCommandTime: new Date(),
		latency: 0,
		movementDelayDiff: 0,
		lastMovementOK: true,
		lastAddBombTime: new Date(),
		addBombDelay: m.addBombDelay
	};

	newPlayer.sprite = this.groups.player.create(m.x, m.y, 'playerSpritesheet' + newPlayer.charType);
	newPlayer.sprite.anchor.set(0.5, 0.5);

	newPlayer.sprite.label = new Phaser.Text(game, 0, 0, label, newPlayer.nameStyle);
	newPlayer.sprite.label.anchor.set(0.5, 1.0);

	this.groups.playerInfo.add(newPlayer.sprite.label);

	if (newPlayer.charType == '001') {
		newPlayer.sprite.animations.add('down', [0, 1, 2], 10);
		newPlayer.sprite.animations.add('left', [12, 13, 14], 10);
		newPlayer.sprite.animations.add('right', [24, 25, 26], 10);
		newPlayer.sprite.animations.add('up', [36, 37, 38], 10);
	} else if (newPlayer.charType == '002') {
		newPlayer.sprite.animations.add('down', [0, 1, 2, 1], 10);
		newPlayer.sprite.animations.add('left', [3, 4, 5, 4], 10);
		newPlayer.sprite.animations.add('right', [6, 7, 8, 7], 10);
		newPlayer.sprite.animations.add('up', [9, 10, 11, 10], 10);
	} else if (newPlayer.charType == '003') {
		newPlayer.sprite.animations.add('down', [0, 1, 2, 3], 6);
		newPlayer.sprite.animations.add('left', [4, 5, 6, 7], 6);
		newPlayer.sprite.animations.add('right', [8, 9, 10, 11], 6);
		newPlayer.sprite.animations.add('up', [12, 13, 14, 15], 6);
	} else if (newPlayer.charType == '004') {
		newPlayer.sprite.animations.add('down', [0, 1, 2, 1], 10);
		newPlayer.sprite.animations.add('left', [3, 4, 5, 4], 10);
		newPlayer.sprite.animations.add('right', [6, 7, 8, 7], 10);
		newPlayer.sprite.animations.add('up', [9, 10, 11, 10], 10);
	} else if (newPlayer.charType == '005') {
		newPlayer.sprite.animations.add('down', [0, 1, 2, 3], 6);
		newPlayer.sprite.animations.add('left', [4, 5, 6, 7], 6);
		newPlayer.sprite.animations.add('right', [8, 9, 10, 11], 6);
		newPlayer.sprite.animations.add('up', [12, 13, 14, 15], 6);
	} else if (newPlayer.charType == '006') {
		newPlayer.sprite.animations.add('down', [0, 1, 2, 3], 6);
		newPlayer.sprite.animations.add('left', [4, 5, 6, 7], 6);
		newPlayer.sprite.animations.add('right', [8, 9, 10, 11], 6);
		newPlayer.sprite.animations.add('up', [12, 13, 14, 15], 6);
	} else if (newPlayer.charType == '007') {
		newPlayer.sprite.animations.add('down', [0, 1, 2, 1], 10);
		newPlayer.sprite.animations.add('left', [3, 4, 5, 4], 10);
		newPlayer.sprite.animations.add('right', [6, 7, 8, 7], 10);
		newPlayer.sprite.animations.add('up', [9, 10, 11, 10], 10);
	}

	this.playerSetPosition(newPlayer, newPlayer.position.x, newPlayer.position.y, true);
	this.playerSetDirection(newPlayer, newPlayer.direction);
	this.addSpawnEffect(newPlayer.sprite, 2);

	return newPlayer;
};

GameApp.GameState.prototype.spawnBomb = function (m) {
	"use strict";

	var newBomb = {
		position: {
			x: m.x,
			y: m.y
		},
		bombType: m.bombType,
		direction: m.direction,
		movementDelay: m.movementDelay,
		fireLength: m.fireLength,
		fireDelay: m.fireDelay,
		sprite: null
	};

	newBomb.sprite = this.groups.bomb.create(0, 0, 'bombSpritesheet' + newBomb.bombType);

	if (newBomb.bombType == '001') {
		newBomb.sprite.animations.add('idle', [0, 1, 2], 10);
		newBomb.sprite.animations.play('idle', 10, true);
	}

	this.bombSetPosition(newBomb, newBomb.position.x, newBomb.position.y);

	return newBomb;
};

GameApp.GameState.prototype.spawnBombFired = function (bomb) {
	"use strict";

	if (bomb) {
		var explosionPointList = [];
		explosionPointList.push({ x: bomb.position.x, y: bomb.position.y });

		for (var x = 0; x < bomb.fireLength; x++) {
			explosionPointList.push({ x: bomb.position.x + (x + 1), y: bomb.position.y });
			explosionPointList.push({ x: bomb.position.x - (x + 1), y: bomb.position.y });
			explosionPointList.push({ x: bomb.position.x, y: bomb.position.y + (x + 1) });
			explosionPointList.push({ x: bomb.position.x, y: bomb.position.y - (x + 1) });
		}

		for (var y = 0; y < explosionPointList.length; y++) {
			this.addSpawnEffect({ x: explosionPointList[y].x, y: explosionPointList[y].y }, 6);
		}
	}
};

GameApp.GameState.prototype.updatePosition = function (m) {
	"use strict";

	if (this.players[m.id]) {
		this.playerSetDirection(this.players[m.id], m.direction);
		this.playerSetPosition(this.players[m.id], m.x, m.y, false);
	}
};

GameApp.GameState.prototype.addSpawnEffect = function (o, effect) {
	"use strict";

	if (effect == 1) {
		var effect1 = this.groups.underPlayer.getFirstExists(false, true, o.x - 192 / 2 + o.width / 2, o.y - 192 / 2 + 10, 'effectSpritesheet001');
		effect1.anchor.set(0.5, 0.5);
		effect1.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 30);
		effect1.play('default', 30, false, true);
	} else if (effect == 2) {
		var effect2 = this.groups.underPlayer.getFirstExists(false, true, o.x, o.y - 10, 'effectSpritesheet002');
		effect2.anchor.set(0.5, 0.5);
		effect2.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 30);
		effect2.play('default', 12, false, true);
	} else if (effect == 3) {
		var effect3 = this.groups.underPlayer.getFirstExists(false, true, o.x - 192 / 2 + o.width / 2, o.y - 192 / 2 + 10, 'effectSpritesheet003');
		effect3.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 30);
		effect3.play('default', 30, false, true);
	} else if (effect == 4) {
		var effect4 = game.add.graphics(o.x, o.y);
		effect4.beginFill(0x000000, 1);
		effect4.drawCircle(0, 0, 10);
		game.add.tween(effect4).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false).onComplete.add(function (target, tween) {
			target.destroy();
		}, this);
	} else if (effect == 5) {
		var effect5 = game.add.graphics(o.x, o.y);
		this.groups.underPlayer.add(effect5);
		effect5.lineStyle(2, 0x000000, 1);
		effect5.drawRect(0, 0, GameApp.TILE_SIZE, GameApp.TILE_SIZE);
		game.add.tween(effect5).to({ alpha: 0 }, 200, Phaser.Easing.Linear.None, true, 0, 0, false).onComplete.add(function (target, tween) {
			target.destroy();
		}, this);
	} else if (effect == 6) {
		var effect6 = this.groups.underPlayer.getFirstExists(false, true, (o.x * GameApp.TILE_SIZE) + (GameApp.TILE_SIZE / 2), (o.y * GameApp.TILE_SIZE) + (GameApp.TILE_SIZE / 2), 'bombFlameSpritesheet001');
		effect6.animations.add('default', [0, 1, 2, 3, 4], 12);
		effect6.anchor.set(0.5, 0.5);
		effect6.play('default', 12, false, true);
	}
};

GameApp.GameState.prototype.playerMoveToDestination = function () {
	"use strict";

	if (!this.player) {
		return;
	}

	if (this.player.destination.x == this.player.position.x && this.player.destination.y == this.player.position.y) {
		this.player.isMoving = false;
		clearTimeout(this.player.autoMovingTimer);
		return;
	}

	var context = this;
	var useTween = true;

	if (useTween) {
		if (this.player.isMovingTweenAlive || !this.playerCanMove()) {
			clearTimeout(this.player.autoMovingTimer);

			this.player.autoMovingTimer = setTimeout(function () {
				context.playerMoveToDestination();
			}, 1);

			return;
		}

		if (this.player.destination.x > this.player.position.x) {
			this.playerMoveToRight();
		} else if (this.player.destination.x < this.player.position.x) {
			this.playerMoveToLeft();
		} else if (this.player.destination.y > this.player.position.y) {
			this.playerMoveToDown();
		} else if (this.player.destination.y < this.player.position.y) {
			this.playerMoveToUp();
		}

		this.player.lastMovementTime = new Date();
	} else {
		this.player.lastMovementTime = new Date();
		this.playerSetPosition(this.player, this.player.destination.x, this.player.destination.y, false);
	}

	this.player.autoMovingTimer = setTimeout(function () {
		context.playerMoveToDestination();
	}, this.player.movementDelay + this.player.movementDelayDiff);
};

GameApp.GameState.prototype.playerSetDirection = function (player, direction) {
	"use strict";

	switch (direction) {
		case 1:
			player.direction = direction;
			player.sprite.play("up");
			break;

		case 2:
			player.direction = direction;
			player.sprite.play("right");
			break;

		case 3:
			player.direction = direction;
			player.sprite.play("down");
			break;

		case 4:
			player.direction = direction;
			player.sprite.play("left");
			break;
	}
};

GameApp.GameState.prototype.playerSetPosition = function (player, x, y, now) {
	"use strict";

	var destinationX = 0;
	var destinationY = 0;

	if (player.charType == "002" || player.charType == "007") {
		destinationX = (x * GameApp.TILE_SIZE) + (GameApp.TILE_SIZE / 2);
		destinationY = (y * GameApp.TILE_SIZE) - (GameApp.TILE_SIZE / 4);
	} else {
		destinationX = (x * GameApp.TILE_SIZE) + (GameApp.TILE_SIZE / 2);
		destinationY = (y * GameApp.TILE_SIZE) + (GameApp.TILE_SIZE / 4);
	}

	if (player.sprite.x == destinationX && player.sprite.y == destinationY) {
		clearTimeout(player.movingTimer);
		player.isMoving = false;
		return;
	}

	var useTween = true;

	player.position.x = x;
	player.position.y = y;

	if (now) {
		player.sprite.x = destinationX;
		player.sprite.y = destinationY;

		this.playerLabelSetPosition(player);

		player.isMoving = false;
	} else {
		if (useTween) {
			player.isMovingTweenAlive = true;

			player.movingTween = game.add.tween(player.sprite);

			player.movingTween.onComplete.add(function (target, tween) {
				player.position.x = x;
				player.position.y = y;

				this.playerLabelSetPosition(player);

				player.isMovingTweenAlive = false;
				player.isMoving = false;
			}, this);

			player.movingTween.onUpdateCallback(function () {
				this.playerLabelSetPosition(player);
				this.playerSetDirection(player, player.direction);
			}, this);

			player.movingTween.to({
				x: destinationX,
				y: destinationY
			}, player.movementDelay + player.movementDelayDiff, Phaser.Easing.Linear.None, true, 0, 0, false);
		} else {
			var walkingOffset = 8;

			if (destinationX > player.sprite.x) {
				player.sprite.x = player.sprite.x + walkingOffset;
			} else if (destinationX < player.sprite.x) {
				player.sprite.x = player.sprite.x - walkingOffset;
			} else if (destinationY > player.sprite.y) {
				player.sprite.y = player.sprite.y + walkingOffset;
			} else if (destinationY < player.sprite.y) {
				player.sprite.y = player.sprite.y - walkingOffset;
			}

			this.playerLabelSetPosition(player);

			var context = this;

			player.movingTimer = setTimeout(function () {
				context.playerSetPosition(player, x, y, now);
			}, player.movementDelay + player.movementDelayDiff);
		}
	}
};

GameApp.GameState.prototype.playerCancelMovement = function () {
	"use strict";

	clearTimeout(this.player.autoMovingTimer);
	clearTimeout(this.player.movingTimer);

	this.player.isMoving = false;
	this.player.isMovingTweenAlive = false;

	var context = this;

	if (this.player.movingTween) {
		game.tweens.remove(context.player.movingTween);
	}
};

GameApp.GameState.prototype.playerCanMove = function () {
	"use strict";

	var currentMS = new Date().getTime();
	var lastMovementMS = this.player.lastMovementTime.getTime();
	var ms = currentMS - (lastMovementMS + this.player.movementDelayDiff);

	if (ms <= this.player.movementDelay) {
		return false;
	}

	if (!this.player.lastMovementOK) {
		return false;
	}

	return true;
};

GameApp.GameState.prototype.playerCanAddBomb = function () {
	"use strict";

	if (!this.player) {
		return;
	}

	var currentMS = new Date().getTime();
	var lastAddBombMS = this.player.lastAddBombTime.getTime();
	var ms = currentMS - lastAddBombMS;

	if (ms <= this.player.addBombDelay) {
		return false;
	}

	return true;
};

GameApp.GameState.prototype.sendPositionCommand = function (posX, posY, direction) {
	"use strict";

	if (GameApp.DEBUG) {
		console.log("Your new position: X: " + posX + " - Y: " + posY);
	}

	var msg = JSON.stringify({
		type: "move",
		x: posX,
		y: posY,
		direction: direction
	});

	GameApp.data.socket.send(msg);
};

GameApp.GameState.prototype.sendAddBombCommand = function (posX, posY) {
	"use strict";

	var msg = JSON.stringify({
		type: "bomb-add",
		x: posX,
		y: posY
	});

	GameApp.data.socket.send(msg);
};

GameApp.GameState.prototype.sendGameDataCommand = function (posX, posY) {
	"use strict";

	var msg = JSON.stringify({
		type: "game-data"
	});

	GameApp.data.socket.send(msg);
};

GameApp.GameState.prototype.bombSetPosition = function (bomb, x, y) {
	"use strict";

	var destinationX = (x * GameApp.TILE_SIZE) - (bomb.sprite.width / 2) + 16;
	var destinationY = (y * GameApp.TILE_SIZE) - bomb.sprite.height + GameApp.TILE_SIZE;

	bomb.sprite.x = destinationX;
	bomb.sprite.y = destinationY;

	bomb.position.x = x;
	bomb.position.y = y;
};

GameApp.GameState.prototype.playerLabelSetPosition = function (player) {
	"use strict";

	if (player) {
		player.sprite.label.x = player.sprite.x;
		player.sprite.label.y = player.sprite.y - (player.sprite.height / 2);
	}
};