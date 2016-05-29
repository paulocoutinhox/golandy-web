var GameApp = GameApp || {};

GameApp.LoadingState = function () {
    "use strict";
    Phaser.State.call(this);
};

GameApp.LoadingState.prototype = Object.create(Phaser.State.prototype);
GameApp.LoadingState.prototype.constructor = GameApp.LoadingState;

GameApp.LoadingState.prototype.init = function (assetsName, assetsFile, nextState) {
    "use strict";
    this.assetsName = assetsName;
    this.assetsFile = assetsFile;
    this.nextState = nextState;
};

GameApp.LoadingState.prototype.preload = function () {
    "use strict";

    var loadingImage = this.add.sprite(game.world.centerX, game.world.centerY, 'loadingImage');
    loadingImage.anchor.setTo(0.5);

    if (this.assetsName && this.assetsFile) {
        this.load.text(this.assetsName, this.assetsFile);
    }
};

GameApp.LoadingState.prototype.create = function () {
    "use strict";

    GameApp.resetState();

    var assetsText = null;
    var assetsData = null;

    if (this.assetsName && this.assetsFile) {
        assetsText = this.game.cache.getText(this.assetsName);
        assetsData = JSON.parse(assetsText);
    }

    game.state.start("LoadingDataState", true, false, assetsData, this.nextState);
};