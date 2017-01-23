"use strict";
class Room {
    constructor(hostPlayer, roomName, locked) {
        this.hostPlayer = hostPlayer;
        this.roomName = roomName;
        this.locked = locked;
        this.players = [];
        this.level = 0;
        this.bots = 0;
    }
    static deserialize(input) {
        if (input) {
            let room = new Room(input.hostPlayer, input.roomName, input.locked);
            room.players = input.players;
            room.isHostAction = input.isHostAction;
            room.level = input.level;
            return room;
        }
        else {
            return null;
        }
    }
    static serialize(input, isHostAction) {
        if (input) {
            let room = new Room(input.hostPlayer, input.roomName, input.locked);
            room.players = input.players;
            room.isHostAction = isHostAction;
            room.level = input.level;
            return room;
        }
        else {
            return null;
        }
    }
    getHostPlayer() {
        return this.hostPlayer;
    }
    getName() {
        return this.roomName;
    }
    getExistingPlayerNames() {
        return this.players.map(i => i.name);
    }
    playerExists(playerName) {
        return !!this.players.find(i => i.name === playerName);
    }
    isLocked() {
        return this.locked;
    }
    canJoin(playerName, password) {
        let exists = this.players.find(i => i.name === playerName);
        return playerName && !exists &&
            (this.isLocked() === false
                || this.hostPlayer.name === playerName
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
        let player = this.players.find(i => i.name === playerName);
        if (player) {
            this.players.splice(this.players.indexOf(player), 1);
        }
    }
}
exports.Room = Room;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/room.js.map