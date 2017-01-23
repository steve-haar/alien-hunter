"use strict";
const enum_1 = require("./enum");
const game_element_1 = require("./game-element");
class Bot extends game_element_1.GameElement {
    constructor() {
        super(enum_1.ElementType.Alien);
    }
    canPushBlocks() {
        return false;
    }
}
exports.Bot = Bot;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/bot.js.map