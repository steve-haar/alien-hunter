"use strict";
class Player {
    constructor(sessionId, name, id, x, y, z) {
        this.sessionId = sessionId;
        this.name = name;
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static deserialize(input) {
        return new Player(input.sessionId, input.name, input.id, input.x, input.y, input.z);
    }
    static serialize(input) {
        return input;
    }
    getSessionId() {
        return this.sessionId;
    }
    getName() {
        return this.name;
    }
    setPosition(coordinate) {
        this.x = coordinate.x;
        this.y = coordinate.y;
        this.z = coordinate.z;
    }
}
exports.Player = Player;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/player.js.map