import { Subject } from 'rxjs/Subject';
import { GameRenderService } from './../services/game-render.service';
import { Component, OnInit, OnChanges, ElementRef, Input, Output, SimpleChanges, HostListener, EventEmitter } from '@angular/core';
import { Direction } from '../../../../../shared/model/enum';
import { GameBoard } from '../../../../../shared/model/game-board';
import { Movement } from './../movement';

import 'rxjs/add/operator/do';

const RenderInterval = 16;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnChanges {
  @Input() gameScene: GameBoard;
  @Output() move = new EventEmitter<Direction>();

  private gameBoardChanges = new Subject<GameBoard>();
  private gameRenderService: GameRenderService;
  private currentDirections: Direction[] = [];
  private movement = Movement.Player;

  constructor(private myElement: ElementRef) {
    this.gameRenderService = new GameRenderService(this.myElement.nativeElement);
    if (this.gameScene) {
      this.gameRenderService.updateScene(this.gameScene);
    }
  }

  ngOnInit() {
    this.gameBoardChanges
      .do(gameScene => this.gameRenderService.updateScene(gameScene))
      .subscribe();

    setInterval(() => this.updateCameraAndRender(), RenderInterval);
  }

  ngOnChanges(changes: SimpleChanges) {
    let room = changes['gameScene'];
    if (room && room.currentValue) {
      this.gameBoardChanges.next(room.currentValue);
    }
  }

  @HostListener('document:keydown', ['$event'])
  keydown(event) {
    let movement = this.getMovement(event.key);
    if (movement !== Movement.Player && this.movement !== movement) {
      this.currentDirections = [];
      if (this.movement === Movement.Player) {
        this.move.emit(this.getCurrentDirection());
      }
      this.movement = movement;
    }

    let oldDirection = this.getCurrentDirection();
    let direction = this.getDirection(event.key);
    if (direction && this.getCurrentDirection() !== direction) {
      this.currentDirections.push(direction);
    }

    let newDirection = this.getCurrentDirection();
    if (this.movement === Movement.Player && newDirection !== oldDirection) {
      this.move.emit(newDirection);
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyup(event) {
    let movement = this.getMovement(event.key);
    if (this.movement === movement) {
      this.movement = Movement.Player;
    }

    let oldDirection = this.getCurrentDirection();
    let direction = this.getDirection(event.key);
    if (direction) {
      this.currentDirections.splice(this.currentDirections.indexOf(direction), 1);
    }

    let newDirection = this.getCurrentDirection();
    if (this.movement === Movement.Player && newDirection !== oldDirection) {
      this.move.emit(newDirection);
    }
  }

  private updateCameraAndRender() {
    if (this.movement !== Movement.Player) {
      this.gameRenderService.updateCamera(this.movement, this.getCurrentDirection());
    }
    this.gameRenderService.render();
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

  private getMovement(key: string): Movement {
    switch (key) {
      case 'c':
        return Movement.CameraXY;
      case 'z':
        return Movement.CameraZ;
      case 'r':
        return Movement.CameraRotation;
      default:
        return Movement.Player;
    }
  }

  private getCurrentDirection() {
    return this.currentDirections.length ? this.currentDirections[this.currentDirections.length - 1] : Direction.None;
  }
}
