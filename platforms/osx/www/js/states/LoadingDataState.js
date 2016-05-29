var GameApp = GameApp || {};

GameApp.LoadingDataState = function () {
    "use strict";
    Phaser.State.call(this);
};

GameApp.LoadingDataState.prototype = Object.create(Phaser.State.prototype);
GameApp.LoadingDataState.prototype.constructor = GameApp.LoadingDataState;

GameApp.LoadingDataState.prototype.init = function (assetsData, nextState) {
    "use strict";
    this.assetsData = assetsData;
    this.nextState = nextState;
};

GameApp.LoadingDataState.prototype.preload = function () {
    "use strict";

    var loadingImage = this.add.sprite(game.world.centerX, game.world.centerY, 'loadingImage');
    loadingImage.anchor.setTo(0.5);

    var assets, assetKey, asset;

    if (this.assetsData) {
        assets = this.assetsData.assets;
    }

    if (assets) {
        for (assetKey in assets) {
            if (assets.hasOwnProperty(assetKey)) {
                asset = assets[assetKey];
                asset.source = this.putAssetsVersion(asset.source);

                switch (asset.type) {
                    case "image":
                        this.load.image(assetKey, asset.source);
                        break;
                    case "spritesheet":
                        this.load.spritesheet(assetKey, asset.source, asset.frame_width, asset.frame_height);
                        break;
                    case "tilemap":
                        this.load.tilemap(assetKey, asset.source, null, Phaser.Tilemap.TILED_JSON);
                        break;
                }
            }
        }
    }
};

GameApp.LoadingDataState.prototype.create = function () {
    "use strict";
    GameApp.resetState();
    game.state.start(this.nextState, true, false, this.assetsData);
};

GameApp.LoadingDataState.prototype.putAssetsVersion = function (filename) {
    "use strict";
    return filename + '?v=' + GameApp.ASSETS_VERSION;
};