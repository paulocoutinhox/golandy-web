var GameApp = GameApp || {};

GameApp.LoginState = function () {
    "use strict";
    Phaser.State.call(this);
};

GameApp.LoginState.prototype = Object.create(Phaser.State.prototype);
GameApp.LoginState.prototype.constructor = GameApp.LoginState;

GameApp.LoginState.prototype.init = function (assetsData, nextState) {
    "use strict";
    this.assetsData = assetsData;
    this.nextState = nextState;
};

GameApp.LoginState.prototype.create = function () {
    "use strict";

    GameApp.resetState();

    // background
    var background = game.add.image(game.world.centerX, game.world.centerY, 'stateBackgroundDefault');
    background.anchor.set(0.5);

    // imagem de progresso
    var progressImage = game.add.sprite(game.world.centerX, game.world.centerY, 'connecting');
    progressImage.anchor.set(0.5);

    // conecta ao servidor
    GameApp.data.socket = null;
    GameApp.data.socket = new WebSocket("ws://" + GameApp.data.serverIP + "/ws");

    GameApp.data.socket.onopen = function () {
        var message = JSON.stringify({
            type: "login",
            username: "demo",
            password: "demo",
            version: GameApp.data.appVersion
        });

        GameApp.data.socket.send(message);
    };

    GameApp.data.socket.onmessage = function (message) {
        var m = JSON.parse(message.data);

        if (m.type) {
            switch (m.type) {
                case "login-ok":
                    GameApp.data.online = true;
                    game.state.start("LoadingState", true, false, null, null, "GameState");
                    break;

                case "login-invalid":
                    game.state.start("LoadingState", true, false, null, null, "TitleState");
                    break;

                case "version-invalid":
                    game.state.start("LoadingState", true, false, null, null, "TitleState");
                    break;
            }
        }
    };

    GameApp.data.socket.onerror = function () {
        game.state.start("LoadingState", true, false, null, null, "TitleState");
    }
};