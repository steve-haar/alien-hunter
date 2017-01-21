"use strict";
const enum_1 = require("./enum");
const game_element_1 = require("./game-element");
class Block extends game_element_1.GameElement {
    constructor(color) {
        super(enum_1.ElementType.Block);
        this.color = color;
    }
}
exports.Block = Block;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/block.js.map