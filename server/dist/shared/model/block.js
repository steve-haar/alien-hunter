"use strict";
class Block {
    constructor(color, id, x, y, z) {
        this.color = color;
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static deserialize(input) {
        return new Block(input.color, input.id, input.x, input.y, input.z);
    }
    static serialize(input) {
        return input;
    }
}
exports.Block = Block;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/block.js.map