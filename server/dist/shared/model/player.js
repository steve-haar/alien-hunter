"use strict";
const enum_1 = require("./enum");
const game_element_1 = require("./game-element");
class Player extends game_element_1.GameElement {
    constructor(sessionId, name, playerType) {
        super(playerType === enum_1.PlayerType.Alien ? enum_1.ElementType.Alien : enum_1.ElementType.Hunter);
        this.sessionId = sessionId;
        this.name = name;
        this.playerType = playerType;
    }
    canPushBlocks() {
        return this.playerType === enum_1.PlayerType.Hunter;
    }
}
exports.Player = Player;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/player.js.map