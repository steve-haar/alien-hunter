"use strict";
const _1 = require("./");
class GameScene {
    constructor(players, blocks) {
        this.players = players;
        this.blocks = blocks;
    }
    static deserialize(input) {
        return new GameScene(input.players.map(i => _1.Player.deserialize(i)), input.blocks.map(i => _1.Block.deserialize(i)));
    }
    static serialize(input) {
        return input;
    }
}
exports.GameScene = GameScene;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/game-scene.js.map