import { GameBoard } from './../../shared/model/game-board';
import { Room } from './../../shared/model/room';
import { Direction } from '../../shared/model/enum';
import { NameService, RoomService, GameService } from './services';
import * as io from 'socket.io';
import * as http from 'http';

const HunterUpdateInterval = 75;
const AlienUpdateInterval = 75;
const BotUpdateInterval = 30000;

export class SocketServer {
  private socketServer: SocketIO.Server;
  private nameService = new NameService();
  private roomService = new RoomService();
  private gameService = new GameService();
  private gameIntervals = {};

  constructor(private httpServer: http.Server) {
    this.socketServer = io.listen(httpServer);
  }

  setup() {
    this.socketServer.on('connection', (socket) => {
      socket.on('join', (playerName, roomName, password) => this.onJoin(socket, socket.client.id, playerName, roomName, password));
    });
  }

  private onJoin(socket, sessionId, playerName, roomName, password) {
    if (playerName) {
      this.joinRoom(socket, sessionId, playerName, roomName, password);
    } else {
      let room = this.roomService.getRoom(roomName);
      let existingNames = room ? room.getExistingPlayerNames() : [];
      this.nameService.getName(existingNames).then(playerName => this.joinRoom(socket, sessionId, playerName, roomName, password));
    }
  }

  private joinRoom(socket, sessionId, playerName, roomName, password) {
    let room = this.roomService.getRoom(roomName);
    this.joinRoomInternal(socket, sessionId, playerName, roomName, password);
  }

  private joinRoomInternal(socket, sessionId, playerName, roomName, password) {
    if (this.roomService.joinRoom(sessionId, playerName, roomName, password)) {
      let room = this.roomService.getRoom(roomName);
      socket.join('room:' + roomName);
      this.broadcastPlayerNameUpdates(room);
      this.broadcastUpdate(room, room.getHostPlayer().name === playerName);
      this.hookEvents(socket, playerName, room);
    } else {
      this.socketServer.to(sessionId).emit('update', null);
    }
  }

  private hookEvents(socket: any, playerName: string, room: Room) {
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
      if (playerToKick && this.roomService.kickPlayer(playerName, room.getName(), playerToKick.sessionId)) {
        let sessionIdToKick = playerToKick.sessionId;
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

    socket.in('room:' + room.getName()).on('updateGameOptions', (options) => {
      this.roomService.updateGameOptions(playerName, room.getName(), options);
      this.broadcastUpdate(room, true);
    });

    socket.in('room:' + room.getName()).on('startGame', () => {
      this.gameService.startGame(room);
      this.broadcastGameUpdate(room.getName());
      this.gameIntervals[room.getName()] = setInterval(() => this.moveHunters(room.getName()), HunterUpdateInterval);
      this.gameIntervals[room.getName()] = setInterval(() => this.moveAliens(room.getName()), AlienUpdateInterval);
      this.gameIntervals[room.getName()] = setInterval(() => this.moveBots(room.getName()), BotUpdateInterval);
    });

    socket.in('room:' + room.getName()).on('move', (direction: Direction) => {
      this.gameService.move(room.getName(), playerName, direction);
    });

    socket.in('room:' + room.getName()).on('health', () => {
      let player = this.getPlayer(room, playerName);
      this.socketServer.to(player.sessionId).emit('health');
    });
  }

  private getPlayer(room: Room, playerName: string) {
    return room.players.find(i => i.name === playerName);
  }

  private moveHunters(roomName: string) {
    this.gameService.moveHunters(roomName);
    this.broadcastGameUpdate(roomName);
  }

  private moveAliens(roomName: string) {
    this.gameService.moveAliens(roomName);
    this.broadcastGameUpdate(roomName);
  }

  private moveBots(roomName: string) {
    this.gameService.moveBots(roomName);
    this.broadcastGameUpdate(roomName);
  }

  private broadcastGameUpdate(roomName: string) {
    let gameBoard = this.gameService.getGameBoard(roomName);
    this.socketServer.in('room:' + roomName).emit('game', GameBoard.serialize(gameBoard));
  }

  private broadcastUpdate(room: Room, isHostAction: boolean) {
    this.socketServer.in('room:' + room.getName()).emit('room', Room.serialize(room, isHostAction));
  }

  private broadcastPlayerNameUpdates(room: Room) {
    room.players.map(player => {
      let sessionId = player.sessionId;
      this.socketServer.to(sessionId).emit('playerName', player.name);
    });
  }
}
