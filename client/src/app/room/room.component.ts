import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';

import { Direction } from '../../../../shared/model/enum';
import { Room } from '../../../../shared/model/room';
import { GameBoard } from '../../../../shared/model/game-board';
import { RoomService } from '../shared/services/room.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
  playerName: string;
  roomName: string;
  room: Observable<Room>;
  gameBoard: Observable<GameBoard>;
  roomService = new RoomService();

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.roomName = params['room'];
      this.roomService.connect(environment.baseServerUrl);
      this.joinRoom();
    });
  }

  ngOnDestroy() {
    this.roomService.disconnect();
  }

  startGame() {
    this.roomService.startGame();
  }

  move(direction: Direction) {
    this.roomService.move(direction);
  }

  updateGameOptions(level: number, bots: number) {
    this.roomService.updateGameOptions(level, bots);
  }

  private joinRoom(password?: string) {
    let obs = this.roomService.joinRoom(this.playerName, this.roomName, password, (playerName) => this.playerName = playerName);
    this.room = obs[0];
    this.gameBoard = obs[1];
  }
}
