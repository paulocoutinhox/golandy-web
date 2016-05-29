var GameApp = GameApp || {};

GameApp.BootState = function () {
    "use strict";
    Phaser.State.call(this);
};

GameApp.BootState.prototype = Object.create(Phaser.State.prototype);
GameApp.BootState.prototype.constructor = GameApp.BootState;

GameApp.BootState.prototype.init = function () {
    "use strict";

    game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize = true;
    game.scale.refresh();

    var serverIP = "golandy-server.prsolucoes.com";

    if (document.location.hostname != "golandy.prsolucoes.com" && document.location.hostname != "golandy.com") {
        serverIP = document.location.hostname;
    }

    serverIP = "golandy-server.prsolucoes.com";

    GameApp.data = {
        socket: null,
        appVersion: GameApp.APP_VERSION,
        online: false,
        serverIP: serverIP
    }
};

GameApp.BootState.prototype.preload = function () {
    "use strict";

    var imageFile = 'loading.png';
    imageFile = imageFile + '?v=' + GameApp.ASSETS_VERSION;

    this.load.image("loadingImage", "assets/images/meta/" + imageFile);
};

GameApp.BootState.prototype.create = function () {
    "use strict";

    GameApp.resetState();

    /*EZGUI.Theme.load(['assets/gui-themes/metalworks-theme/metalworks-theme.json'], function () {
        /!*
         var themeOverride = {
         levelBtn: {
         image: '../../assets/img/level-box.png',
         font: { size: '45px', family: 'Skranji', color: 'white' },
         anchor: {x:0.5, y:0.5}
         },
         }

         EZGUI.themes['metalworks'].override(themeOverride);
         *!/
    });*/

    var jsonFile = 'boot.json';
    jsonFile = jsonFile + '?v=' + GameApp.ASSETS_VERSION;

    game.state.start("LoadingState", true, false, "gameData", "assets/levels/" + jsonFile, "TitleState");
};