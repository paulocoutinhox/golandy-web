window.onload = function () {
    var game = new Phaser.Game(document.offsetWidth, document.offsetWidth, Phaser.AUTO, null, {
        preload: preload,
        create: create,
        update: update
    });

    var player,
        players = {},
        sock,
        label,
        style = {
            font: "12px Arial",
            fill: "#ffffff"
        },
        ip = "golandy-server.prsolucoes.com",
        map,
        floorLayer,
        metaLayer,
        charType = 'char002';

    function preload() {
        game.load.spritesheet('char001', 'images/chars/char001.png', 32, 48);
        game.load.spritesheet('char002', 'images/chars/char002.png', 48, 72);
        game.load.spritesheet('effect001', 'images/effects/effect001.png', 192, 192);
        game.load.spritesheet('effect002', 'images/effects/effect002.png', 192, 192);
        game.load.spritesheet('effect003', 'images/effects/effect003.png', 196, 200);
        game.load.tilemap('map1', 'maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('meta', 'images/tilesets/meta.png');
        game.load.image('tileset1', 'images/tilesets/tileset1.png');
        game.load.image('tileset2', 'images/tilesets/tileset2.png');
    }

    function create() {
        game.scale.setScreenSize = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#2d2d2d';

        map = game.add.tilemap('map1');
        map.addTilesetImage('meta', 'meta');
        map.addTilesetImage('tileset1', 'tileset1');
        map.addTilesetImage('tileset2', 'tileset2');

        floorLayer = map.createLayer('Floor');
        //metaLayer = map.createLayer('Meta');

        floorLayer.resizeWorld();
        //map.setCollisionBetween(1, 1, true, 'Meta');

        if (charType == 'char001') {
            player = game.add.sprite(0, 0, 'char001');

            player.animations.add('down', [0, 1, 2], 10);
            player.animations.add('left', [12, 13, 14], 10);
            player.animations.add('right', [24, 25, 26], 10);
            player.animations.add('up', [36, 37, 38], 10);
        } else if (charType == 'char002') {
            player = game.add.sprite(0, 0, 'char002');

            player.animations.add('down', [0, 1, 2, 1], 10);
            player.animations.add('left', [3, 4, 5, 4], 10);
            player.animations.add('right', [6, 7, 8, 7], 10);
            player.animations.add('up', [9, 10, 11, 10], 10);
        }

        player.animations.play('down');

        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.collideWorldBounds = true;

        game.camera.follow(player);

        // logo
        var text = game.add.text(0, 0, "Golandy", { font: "30px 'Alegreya Sans'" });
        //text.anchor.setTo(0.5);
        //text.font = 'Alegreya Sans';
        //text.fontSize = 30;

        // create a new ws connection and send our position to others
        sock = new WebSocket("ws://" + ip + ":3030/ws");
        sock.onopen = function () {
            var pos = JSON.stringify({
                x: player.x,
                y: player.y
            });
            sock.send(pos);
        };

        // when we receive a message we spawn, destroy or update a player's
        // position depending on the message's content
        sock.onmessage = function (message) {
            var m = JSON.parse(message.data);
            if (m.New) {
                players[m.Id] = spawn(m);
            } else if (m.Online === false) {
                players[m.Id].label.destroy();
                players[m.Id].destroy();
            } else {
                uPosition(m);
            }
        };
    }

    function update() {
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            player.animations.play('left');
            player.x -= 3;
            var pos = JSON.stringify({
                x: player.x
            });
            sock.send(pos);
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            player.animations.play('right');
            player.x += 3;
            var pos = JSON.stringify({
                x: player.x
            });
            sock.send(pos);
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            player.animations.play('up');
            player.y -= 3;
            var pos = JSON.stringify({
                y: player.y
            });
            sock.send(pos);

        } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
            player.animations.play('down');
            player.y += 3;
            var pos = JSON.stringify({
                y: player.y
            });
            sock.send(pos);
        } else if (game.input.activePointer.isDown) {
            //var currentTile = map.getTile(floorLayer.getTileX(game.input.activePointer.worldX), floorLayer.getTileY(game.input.activePointer.worldY));
            addSpawnEffect({x: game.input.activePointer.worldX, y: game.input.activePointer.worldY, width: 0}, 4);
        }
    }

    function spawn(m) {
        var label = m.Id.match(/(^\w*)-/i)[1];
        var newPlayer;

        if (charType == 'char001') {
            newPlayer = game.add.sprite(m.X, m.Y, 'char001');

            newPlayer.animations.add('down', [0, 1, 2], 10);
            newPlayer.animations.add('left', [12, 13, 14], 10);
            newPlayer.animations.add('right', [24, 25, 26], 10);
            newPlayer.animations.add('up', [36, 37, 38], 10);
        } else if (charType == 'char002') {
            newPlayer = game.add.sprite(0, 0, 'char002');

            newPlayer.animations.add('down', [0, 1, 2, 1], 10);
            newPlayer.animations.add('left', [3, 4, 5, 4], 10);
            newPlayer.animations.add('right', [6, 7, 8, 7], 10);
            newPlayer.animations.add('up', [9, 10, 11, 10], 10);
        }

        newPlayer.label = game.add.text(m.X, m.Y - 10, label, style);

        addSpawnEffect(newPlayer, 2);

        return newPlayer;
    }

    function uPosition(m) {
        if (players[m.Id].x > m.X) {
            players[m.Id].animations.play('left');
        } else if (players[m.Id].x < m.X) {
            players[m.Id].animations.play('right');
        } else if (players[m.Id].y > m.Y) {
            players[m.Id].animations.play('up');
        } else {
            players[m.Id].animations.play('down');
        }

        players[m.Id].x = players[m.Id].label.x = m.X;
        players[m.Id].y = m.Y;
        players[m.Id].label.y = m.Y - 10;
    }

    function addSpawnEffect(o, effect) {
        if (effect == 1) {
            var effect1 = game.add.sprite(o.x - 192 / 2 + o.width / 2, o.y - 192 / 2 + 10, 'effect001');
            effect1.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 30);
            effect1.play('default', 30, false, true);
        } else if (effect == 2) {
            var effect2 = game.add.sprite(o.x - 192 / 2 + o.width / 2, o.y - 192 / 2 + 10, 'effect002');
            effect2.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 30);
            effect2.play('default', 30, false, true);
        } else if (effect == 3) {
            var effect3 = game.add.sprite(o.x - 192 / 2 + o.width / 2, o.y - 192 / 2 + 10, 'effect003');
            effect3.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 30);
            effect3.play('default', 30, false, true);
        } else if (effect == 4) {
            var effect4 = game.add.graphics(o.x, o.y);
            effect4.beginFill(0xFF0000, 1);
            effect4.drawCircle(0, 0, 10);
            game.add.tween(effect4).to( { alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false).onComplete.add(function(target, tween) {
                target.destroy();
            }, this);
        }
    }

};
