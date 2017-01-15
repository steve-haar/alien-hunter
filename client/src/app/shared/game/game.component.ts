import { Subject } from 'rxjs/Subject';
import { GameRenderService } from './../services/game-render.service';
import { Component, OnInit, OnChanges, ElementRef, Input, Output, SimpleChanges, HostListener, EventEmitter } from '@angular/core';
import { GameScene, Direction } from '../../../../../shared/model';

import 'rxjs/add/operator/do';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnChanges {
  @Input() gameScene: GameScene;
  @Output() move = new EventEmitter<Direction>();

  private gameSceneChanges = new Subject<GameScene>();
  private gameRenderService: GameRenderService;
  private currentDirections: Direction[] = [];

  constructor(private myElement: ElementRef) {
    this.gameRenderService = new GameRenderService(this.myElement.nativeElement);
    if (this.gameScene) {
      this.gameRenderService.render(this.gameScene);
    }
  }

  ngOnInit() {
    this.gameSceneChanges
      .do(gameScene => this.gameRenderService.render(gameScene))
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    let room = changes['gameScene'];
    if (room && room.currentValue) {
      this.gameSceneChanges.next(room.currentValue);
    }
  }

  @HostListener('document:keydown', ['$event'])
  keydown(event) {
    let direction = this.getDirection(event.key);
    if (direction && this.getCurrentDirection() !== direction) {
      this.currentDirections.push(direction);
      this.move.emit(this.getCurrentDirection());
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyup(event) {
    let direction = this.getDirection(event.key);
    if (direction) {
      let newMove = this.getCurrentDirection() === direction;
      this.currentDirections.splice(this.currentDirections.indexOf(direction), 1);
      if (newMove) {
        this.move.emit(this.getCurrentDirection());
      }
    }
  }

  private getDirection(key: string): Direction {
    switch (key) {
      case 'ArrowUp':
        return Direction.Up;
      case 'ArrowRight':
        return Direction.Right;
      case 'ArrowDown':
        return Direction.Down;
      case 'ArrowLeft':
        return Direction.Left;
      default:
        return Direction.None;
    }
  }

  private getCurrentDirection() {
    return this.currentDirections.length ? this.currentDirections[this.currentDirections.length - 1] : Direction.None;
  }
}
