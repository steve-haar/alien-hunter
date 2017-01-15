import { GameScene } from './../../../../../shared/model/game-scene';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

import { Room, Direction } from '../../../../../shared/model';

const HealthCheckInterval = 1000;

export class RoomService {
  private socket: SocketIOClient.Socket;
  private healthCheckSendTime;
  public latency;

  connect(url: string) {
    this.socket = io.connect(url);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinRoom(userName: string, roomName: string, password: string, userNameCallback: (userName: string) => void):
    [Observable<Room>, Observable<GameScene>] {
    let roomObs: BehaviorSubject<Room> = new BehaviorSubject<Room>(undefined);
    let gameSceneObs: BehaviorSubject<GameScene> = new BehaviorSubject<GameScene>(undefined);

    if (this.socket.connected) {
      this.socket.emit('join', userName, roomName, password);
    } else {
      this.socket.on('connect', () => this.socket.emit('join', userName, roomName, password));
    }

    this.socket.addEventListener('playerName', userNameCallback);
    this.socket.addEventListener('room', room => roomObs.next(room));
    this.socket.addEventListener('game', gameScene => gameSceneObs.next(gameScene));
    this.socket.addEventListener('health', () => this.latency = new Date().getTime() - this.healthCheckSendTime);

    setInterval(() => this.healthCheck(), HealthCheckInterval);
    return [roomObs, gameSceneObs];
  }

  lockRoom() {
    this.socket.emit('lockRoom');
  }

  unlockRoom() {
    this.socket.emit('unlockRoom');
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
