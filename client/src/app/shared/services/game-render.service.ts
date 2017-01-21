import { ElementRef } from '@angular/core';
import { Player } from './../../../../../shared/model/player';
import { Block } from './../../../../../shared/model/block';
import { element } from 'protractor';
import { GameBoard } from '../../../../../shared/model/game-board';
import { Coordinate } from '../../../../../shared/model/model';
import { ElementType, Direction } from '../../../../../shared/model/enum';
import { Movement } from './../movement';
import { Observable } from 'rxjs/Observable';
import * as THREE from 'three';

const PI_2 = Math.PI / 2;
const GameWidth = 40;
const GameHeight = 30;
const Scale = 20;
const ViewAngle = 45;
const Aspect = GameWidth / GameHeight;
const Near = 0.1;
const Far = 1000;

export class GameRenderService {
  private renderer = new THREE.WebGLRenderer();
  private camera = new THREE.PerspectiveCamera(ViewAngle, Aspect, Near, Far);
  private scene = new THREE.Scene();
  private sceneCreated = false;
  private elements = {};
  private pitchObject = new THREE.Object3D();
  private yawObject = new THREE.Object3D();

  constructor(private element: Element) {
    this.camera.rotation.x = PI_2;
    this.scene.add(this.camera);
    this.renderer.setSize(GameWidth * Scale, GameHeight * Scale);
    this.element.appendChild(this.renderer.domElement);
  }

  updateScene(gameBoard: GameBoard) {
    (<any>window).gameScene = (<any>window).gameScene || gameBoard;
    if (this.sceneCreated === false) {
      this.createScene(gameBoard);
      this.sceneCreated = true;
    }

    this.updateSceneInternal(gameBoard);
  }

  updateCamera(movement: Movement, direction: Direction) {
    switch (movement) {
      case Movement.CameraXY:
        switch (direction) {
          case Direction.Up:
            this.yawObject.position.y += 2;
            break;
          case Direction.Down:
            this.yawObject.position.y -= 2;
            break;
          case Direction.Left:
            this.yawObject.position.x -= 2;
            break;
          case Direction.Right:
            this.yawObject.position.x += 2;
            break;
        }
        break;
      case Movement.CameraZ:
        switch (direction) {
          case Direction.Up:
            this.yawObject.position.z += 2;
            break;
          case Direction.Down:
            this.yawObject.position.z -= 2;
            break;
        }
        break;
      case Movement.CameraRotation:
        switch (direction) {
          case Direction.Up:
            this.pitchObject.rotation.x += 0.05;
            break;
          case Direction.Down:
            this.pitchObject.rotation.x -= 0.05;
            break;
          case Direction.Left:
            this.yawObject.rotation.z += 0.05;
            break;
          case Direction.Right:
            this.yawObject.rotation.z -= 0.05;
            break;
        }

        this.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitchObject.rotation.x));
        break;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  private createScene(gameBoard: GameBoard) {
    console.log(gameBoard);
    this.createCamera();
    this.createFloor();

    for (let y = 0; y < gameBoard.board.length; y++) {
      for (let x = 0; x < gameBoard.board[0].length; x++) {
        let coordinate = new Coordinate(x, y);
        let element = gameBoard.getElement(coordinate);
        if (element) {
          switch (element.type) {
            case ElementType.Alien:
              break;
            case ElementType.Block:
              this.createBlock(<Block>element);
              break;
            case ElementType.Hunter:
              this.createPlayer(<Player>element);
              break;
          }
        }
      }
    }
  }

  private createCamera() {
    this.pitchObject.add(this.camera);
    this.yawObject.rotation.x = -PI_2;
    this.yawObject.position.z = 700;
    this.yawObject.add(this.pitchObject);
    this.scene.add(this.yawObject);
  }

  private createFloor() {
    let width = GameWidth * Scale;
    let height = GameHeight * Scale;
    let geometry = new THREE.PlaneGeometry(width, height);
    let material = new THREE.MeshBasicMaterial();
    material.color = new THREE.Color(0.5, 0.5, 0.5);
    let mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  private createBlock(block: Block) {
    let width = Scale;
    let geometry = new THREE.CubeGeometry(width, width, width);
    let material = new THREE.MeshBasicMaterial();
    material.color = new THREE.Color(0, 0, 1);
    let mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    mesh.position.z = width / 2;
    this.elements[block.id] = mesh;
  }

  private createPlayer(player: Player) {
    let width = Scale;
    let geometry = new THREE.CubeGeometry(width, width, width);
    let material = new THREE.MeshBasicMaterial();
    material.color = new THREE.Color(1, 0, 0);
    let mesh = new THREE.Mesh(geometry, material);
    (<any>window).player = (<any>window).player || mesh;
    mesh.position.z = width / 2;
    this.scene.add(mesh);
    this.elements[player.id] = mesh;
  }

  private updateSceneInternal(gameBoard: GameBoard) {
    for (let y = 0; y < gameBoard.board.length; y++) {
      for (let x = 0; x < gameBoard.board[0].length; x++) {
        let coordinate = new Coordinate(x, y);
        let element = gameBoard.getElement(coordinate);
        if (element) {
          this.updateCoordinate(this.elements[element.id], coordinate);
        }
      }
    }
  }

  private updateCoordinate(mesh: THREE.Mesh, coordinate: Coordinate) {
    mesh.position.x = (coordinate.x - (GameWidth / 2)) * Scale;
    mesh.position.y = ((GameHeight - coordinate.y) - (GameHeight / 2)) * Scale;
  }
}
