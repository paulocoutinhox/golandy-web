// ------------------------------------------
// ----------- INITIALIZE THE GAME ----------
// ------------------------------------------

var GameApp = GameApp || {};
GameApp.USE_DEVICE_PIXEL_RATIO = false;
GameApp.ASSETS_VERSION = '49';
GameApp.TILE_SIZE = 32;
GameApp.APP_VERSION = '1.0.26';
GameApp.DEBUG = false;

if (GameApp.USE_DEVICE_PIXEL_RATIO) {
    GameApp.DEVICE_PIXEL_RATIO = window.devicePixelRatio;
    GameApp.CANVAS_WIDTH = window.innerWidth * GameApp.DEVICE_PIXEL_RATIO;
    GameApp.CANVAS_HEIGHT = window.innerHeight * GameApp.DEVICE_PIXEL_RATIO;
} else {
    GameApp.DEVICE_PIXEL_RATIO = 1.0;
    GameApp.CANVAS_WIDTH = window.innerWidth * GameApp.DEVICE_PIXEL_RATIO;
    GameApp.CANVAS_HEIGHT = window.innerHeight * GameApp.DEVICE_PIXEL_RATIO;
}

GameApp.ASPECT_RATIO = GameApp.CANVAS_WIDTH / GameApp.CANVAS_HEIGHT;
GameApp.ASPECT_RATIO_ROUND = Math.round(GameApp.ASPECT_RATIO);

if (GameApp.ASPECT_RATIO > 1) {
    GameApp.SCALE_RATIO = GameApp.CANVAS_HEIGHT / GameApp.CANVAS_WIDTH;
} else {
    GameApp.SCALE_RATIO = GameApp.CANVAS_WIDTH / GameApp.CANVAS_WIDTH;
}

// -------------------------------------
// ----------- START THE GAME ----------
// -------------------------------------

var game = new Phaser.Game(GameApp.CANVAS_WIDTH, GameApp.CANVAS_HEIGHT, Phaser.AUTO);

game.state.add("BootState", new GameApp.BootState());
game.state.add("LoadingState", new GameApp.LoadingState());
game.state.add("LoadingDataState", new GameApp.LoadingDataState());
game.state.add("TitleState", new GameApp.TitleState());
game.state.add("GameState", new GameApp.GameState());
game.state.add("LoginState", new GameApp.LoginState());

game.state.start("BootState", true, false);
