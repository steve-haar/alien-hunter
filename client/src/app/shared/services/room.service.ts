import { GameBoard } from './../../../../../shared/model/game-board';
import { Direction } from './../../../../../shared/model/enum';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Room } from '../../../../../shared/model/room';

import * as io from 'socket.io-client';

const HealthCheckInterval = 1000;

export class RoomService {
  private socket: SocketIOClient.Socket;
  private healthCheckSendTime;
  private gameTimes = [];
  public latency;
  public fps;

  connect(url: string) {
    this.socket = io.connect(url);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinRoom(userName: string, roomName: string, password: string, userNameCallback: (userName: string) => void):
    [Observable<Room>, Observable<GameBoard>] {
    let roomObs: BehaviorSubject<Room> = new BehaviorSubject<Room>(undefined);
    let gameBoardObs: BehaviorSubject<GameBoard> = new BehaviorSubject<GameBoard>(undefined);

    if (this.socket.connected) {
      this.socket.emit('join', userName, roomName, password);
    } else {
      this.socket.on('connect', () => this.socket.emit('join', userName, roomName, password));
    }

    this.socket.addEventListener('playerName', userNameCallback);
    this.socket.addEventListener('room', room => roomObs.next(Room.deserialize(room)));
    this.socket.addEventListener('game', gameBoard => {
      let time = new Date().getTime();
      if (this.gameTimes.length === 100) {
        this.fps = Math.round(100000 / (this.gameTimes[99] - this.gameTimes[0]));
        this.gameTimes = [];
      } else {
        this.gameTimes.push(time);
      }
      gameBoardObs.next(GameBoard.deserialize(gameBoard));
    });
    this.socket.addEventListener('health', () => this.latency = new Date().getTime() - this.healthCheckSendTime);

    setInterval(() => this.healthCheck(), HealthCheckInterval);
    return [roomObs, gameBoardObs];
  }

  lockRoom() {
    this.socket.emit('lockRoom');
  }

  unlockRoom() {
    this.socket.emit('unlockRoom');
  }

  updateGameOptions(level: number, bots: number) {
    this.socket.emit('updateGameOptions', { level, bots });
  }

  setPassword(password: string) {
    this.socket.emit('setPassword', password);
  }

  kickUser(userName: string) {
    this.socket.emit('kickUser', userName);
  }

  startGame() {
    this.socket.emit('startGame');
  }

  move(direction: Direction) {
    this.socket.emit('move', direction);
  }

  healthCheck() {
    this.healthCheckSendTime = new Date().getTime();
    this.socket.emit('health');
  }
}
