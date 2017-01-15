"use strict";
const _1 = require("../../shared/model/");
const services_1 = require("./services");
const io = require("socket.io");
const GameUpdateInterval = 16;
class SocketServer {
    constructor(httpServer) {
        this.httpServer = httpServer;
        this.nameService = new services_1.NameService();
        this.roomService = new services_1.RoomService();
        this.gameService = new services_1.GameService();
        this.gameIntervals = {};
        this.socketServer = io.listen(httpServer);
    }
    setup() {
        this.socketServer.on('connection', (socket) => {
            socket.on('join', (playerName, roomName, password) => this.onJoin(socket, socket.client.id, playerName, roomName, password));
        });
    }
    onJoin(socket, sessionId, playerName, roomName, password) {
        if (playerName) {
            this.joinRoom(socket, sessionId, playerName, roomName, password);
        }
        else {
            let room = this.roomService.getRoom(roomName);
            let existingNames = room ? room.getExistingPlayerNames() : [];
            this.nameService.getName(existingNames).then(playerName => this.joinRoom(socket, sessionId, playerName, roomName, password));
        }
    }
    joinRoom(socket, sessionId, playerName, roomName, password) {
        let room = this.roomService.getRoom(roomName);
        this.joinRoomInternal(socket, sessionId, playerName, roomName, password);
    }
    joinRoomInternal(socket, sessionId, playerName, roomName, password) {
        if (this.roomService.joinRoom(sessionId, playerName, roomName, password)) {
            let room = this.roomService.getRoom(roomName);
            socket.join('room:' + roomName);
            this.broadcastPlayerNameUpdates(room);
            this.broadcastUpdate(room, room.getHostPlayer().getName() === playerName);
            this.hookEvents(socket, playerName, room);
        }
        else {
            this.socketServer.to(sessionId).emit('update', null);
        }
    }
    hookEvents(socket, playerName, room) {
        socket.on('disconnect', () => {
            this.roomService.leaveRoom(playerName, room.getName());
            this.broadcastUpdate(room, false);
            if (room.players.length === 0) {
                clearInterval(this.gameIntervals[room.getName()]);
                delete this.gameIntervals[room.getName()];
            }
        });
        socket.in('room:' + room.getName()).on('kickPlayer', (playerNameToKick) => {
            let playerToKick = this.getPlayer(room, playerNameToKick);
            if (playerToKick && this.roomService.kickPlayer(playerName, room.getName(), playerToKick.getName())) {
                let sessionIdToKick = playerToKick.getSessionId();
                let socketToKick = this.socketServer.sockets.connected[sessionIdToKick];
                if (socketToKick) {
                    socketToKick.leave('room:' + room.getName());
                    this.socketServer.to(sessionIdToKick).emit('update', null);
                }
                this.broadcastUpdate(room, false);
            }
        });
        socket.in('room:' + room.getName()).on('lockRoom', (data) => {
            this.roomService.lockRoom(playerName, room.getName());
            this.broadcastUpdate(room, true);
        });
        socket.in('room:' + room.getName()).on('unlockRoom', (data) => {
            this.roomService.unlockRoom(playerName, room.getName());
            this.broadcastUpdate(room, true);
        });
        socket.in('room:' + room.getName()).on('setPassword', (password) => {
            this.roomService.setPassword(playerName, room.getName(), password);
            this.broadcastUpdate(room, true);
        });
        socket.in('room:' + room.getName()).on('startGame', () => {
            this.gameService.startGame(room);
            this.broadcastGameUpdate(room.getName());
            this.gameIntervals[room.getName()] = setInterval(() => this.updateGame(room.getName()), GameUpdateInterval);
        });
        socket.in('room:' + room.getName()).on('move', (direction) => {
            this.gameService.move(room.getName(), playerName, direction);
        });
        socket.in('room:' + room.getName()).on('health', () => {
            let player = this.getPlayer(room, playerName);
            this.socketServer.to(player.getSessionId()).emit('health');
        });
    }
    getPlayer(room, playerName) {
        return room.players.find(i => i.getName() === playerName);
    }
    updateGame(roomName) {
        this.gameService.updateScene(roomName);
        this.broadcastGameUpdate(roomName);
    }
    broadcastGameUpdate(roomName) {
        let gameScene = this.gameService.getGameScene(roomName);
        this.socketServer.in('room:' + roomName).emit('game', _1.GameScene.serialize(gameScene));
    }
    broadcastUpdate(room, isHostAction) {
        this.socketServer.in('room:' + room.getName()).emit('room', _1.Room.serialize(room, isHostAction));
    }
    broadcastPlayerNameUpdates(room) {
        room.players.map(player => {
            let sessionId = player.getSessionId();
            this.socketServer.to(sessionId).emit('playerName', player.getName());
        });
    }
}
exports.SocketServer = SocketServer;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/socket-server.js.map