"use strict";
const _1 = require("./../../../shared/model/");
class GameService {
    constructor() {
        this.gameScenes = {};
    }
    startGame(room) {
        room.players[0].id = 1;
        room.players[0].x = 50;
        room.players[0].y = 50;
        this.gameScenes[room.getName()] = new _1.GameScene(room.players, [new _1.Block('#f00', 1, 0, 0, 0)]);
    }
    updateScene(roomName) {
        let gameScene = this.getGameScene(roomName);
        gameScene.players.map(i => this.movePlayer(gameScene, i));
    }
    move(roomName, playerName, direction) {
        let gameScene = this.getGameScene(roomName);
        let player = this.getPlayer(gameScene, playerName);
        player.queuedDirection = direction;
    }
    getGameScene(roomName) {
        return this.gameScenes[roomName];
    }
    getPlayer(gameScene, playerName) {
        return gameScene.players.find(i => i.getName() === playerName);
    }
    movePlayer(gameScene, player) {
        let oldPosition = { x: player.x, y: player.y, z: player.z };
        let newPosition = undefined;
        switch (player.queuedDirection) {
            case _1.Direction.Up:
                newPosition = oldPosition;
                newPosition.y += 1;
                break;
            case _1.Direction.Down:
                newPosition = oldPosition;
                newPosition.y -= 1;
                break;
            case _1.Direction.Left:
                newPosition = oldPosition;
                newPosition.x -= 1;
                break;
            case _1.Direction.Right:
                newPosition = oldPosition;
                newPosition.x += 1;
                break;
        }
        if (newPosition) {
            player.setPosition(newPosition);
        }
    }
}
exports.GameService = GameService;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/services/game-service.js.map