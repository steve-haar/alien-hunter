"use strict";
class GameElement {
    constructor(type) {
        this.type = type;
        this.id = GameElement._id++;
    }
}
exports.GameElement = GameElement;
GameElement._id = 0;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/game-element.js.map