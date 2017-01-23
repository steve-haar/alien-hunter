"use strict";
const player_1 = require("./../../../shared/model/player");
const room_1 = require("./../../../shared/model/room");
const enum_1 = require("./../../../shared/model/enum");
class RoomService {
    constructor() {
        this.rooms = [];
    }
    getRoom(roomName) {
        return this.rooms.find(i => i.getName() === roomName);
    }
    joinRoom(sessionId, playerName, roomName, password) {
        let player = new player_1.Player(sessionId, playerName, enum_1.PlayerType.Hunter);
        let room = this.getOrCreateRoom(player, roomName);
        let canJoin = room.canJoin(playerName, password);
        if (canJoin) {
            room.join(player);
            console.log(`player: ${playerName} joined ${roomName}`);
        }
        else {
            console.log(`player: ${playerName} can't join ${roomName}; room is locked`);
        }
        return canJoin;
    }
    leaveRoom(playerName, roomName) {
        let room = this.getRoom(roomName);
        if (room && room.playerExists(playerName)) {
            room.leave(playerName);
            console.log(`player: ${playerName} left ${room.getName()}`);
            if (room.getExistingPlayerNames().length === 0) {
                this.rooms.splice(this.rooms.indexOf(room), 1);
                console.log(`room: ${room.getName()} has been deleted`);
            }
        }
    }
    lockRoom(playerName, roomName) {
        let room = this.getRoom(roomName);
        if (room && room.getHostPlayer().name == playerName) {
            room.lock();
            console.log(`room: ${roomName} locked`);
        }
        else {
            console.log(`room: ${roomName} not locked (not host)`);
        }
    }
    unlockRoom(playerName, roomName) {
        let room = this.getRoom(roomName);
        if (room && room.getHostPlayer().name == playerName) {
            room.unlock();
            console.log(`room: ${roomName} unlocked`);
        }
        else {
            console.log(`room: ${roomName} not unlocked (not host)`);
        }
    }
    setPassword(playerName, roomName, password) {
        let room = this.getRoom(roomName);
        if (room && room.getHostPlayer().name == playerName) {
            room.password = password;
            console.log(`password for room ${roomName} is set to ${password}`);
        }
    }
    updateGameOptions(playerName, roomName, options) {
        let room = this.getRoom(roomName);
        if (room && room.getHostPlayer().name == playerName) {
            room.level = options.level;
            room.bots = options.bots;
            console.log(`level and bots for room ${roomName} is set to ${options.level} and ${options.bots}`);
        }
    }
    kickPlayer(playerName, roomName, playerNameToKick) {
        let room = this.getRoom(roomName);
        let kicked = false;
        if (room && room.playerExists(playerName)) {
            if (room && room.getHostPlayer().name == playerName) {
                room.leave(playerName);
                console.log(`player: ${playerName} kicked from ${roomName}`);
                kicked = true;
            }
            else {
                console.log(`player: ${playerName} not kicked from ${roomName} (not host)`);
            }
        }
        return kicked;
    }
    getOrCreateRoom(hostPlayer, roomName) {
        let room = this.getRoom(roomName);
        if (room === undefined) {
            room = new room_1.Room(hostPlayer, roomName, false);
            this.rooms.push(room);
            console.log(`room: ${room.getName()} has been created`);
        }
        return room;
    }
}
exports.RoomService = RoomService;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/services/room-service.js.map