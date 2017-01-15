"use strict";
const _1 = require("./");
class Room {
    constructor(hostPlayer, roomName, locked) {
        this.hostPlayer = hostPlayer;
        this.roomName = roomName;
        this.locked = locked;
        this.players = [];
    }
    static deserialize(input) {
        if (input) {
            let room = new Room(_1.Player.deserialize(input.hostPlayer), input.roomName, input.locked);
            room.players = input.players.map(player => _1.Player.deserialize(player));
            room.isHostAction = input.isHostAction;
            return room;
        }
        else {
            return null;
        }
    }
    static serialize(input, isHostAction) {
        return input;
    }
    getHostPlayer() {
        return this.hostPlayer;
    }
    getName() {
        return this.roomName;
    }
    getExistingPlayerNames() {
        return this.players.map(i => i.getName());
    }
    playerExists(playerName) {
        return !!this.players.find(i => i.getName() === playerName);
    }
    isLocked() {
        return this.locked;
    }
    canJoin(playerName, password) {
        let exists = this.players.find(i => i.getName() === playerName);
        return playerName && !exists &&
            (this.isLocked() === false
                || this.hostPlayer.getName() === playerName
                || this.password && this.password === password);
    }
    lock() {
        this.locked = true;
    }
    unlock() {
        this.locked = false;
    }
    join(player) {
        this.players.push(player);
    }
    leave(playerName) {
        let player = this.players.find(i => i.getName() === playerName);
        if (player) {
            this.players.splice(this.players.indexOf(player), 1);
        }
    }
}
exports.Room = Room;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/room.js.map