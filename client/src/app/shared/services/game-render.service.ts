import { GameScene, Coordinate, Block, Player } from './../../../../../shared/model';
import { Observable } from 'rxjs/Observable';
import * as THREE from 'three';

const GameWidth = 40;
const GameHeight = 30;
const PixelsPerSpace = 10;
const PixelWidth = GameWidth * PixelsPerSpace;
const PixelHeight = GameHeight * PixelsPerSpace;
const ViewAngle = 45;
const Aspect = PixelWidth / PixelHeight;
const Near = 0.1;
const Far = 1000;

export class GameRenderService {
  private renderer = new THREE.WebGLRenderer();
  private camera = new THREE.PerspectiveCamera(ViewAngle, Aspect, Near, Far);
  private scene = new THREE.Scene();
  private sceneCreated = false;
  private blocks = { };
  private players = { };

  constructor(private element: Element) {
    (<any>window).camera = this.camera;
    (<any>window).render = () => this.renderer.render(this.scene, this.camera);
    this.camera.position.z = 200;
    this.scene.add(this.camera);
    this.renderer.setSize(PixelWidth, PixelHeight);
    this.element.appendChild(this.renderer.domElement);
  }

  render(gameScene: GameScene) {
    if (this.sceneCreated === false) {
      this.createScene(gameScene);
      this.sceneCreated = true;
    }

    this.updateScene(gameScene);
    this.renderer.render(this.scene, this.camera);
    console.log('render');
  }

  private createScene(gameScene: GameScene) {
    gameScene.blocks.map(block => this.createBlock(block));
    gameScene.players.map(player => this.createPlayer(player));
  }

  private createBlock(block: Block) {
    let width = PixelsPerSpace;
    let geometry = new THREE.CubeGeometry(width, width, width);
    let material = new THREE.MeshBasicMaterial();
    material.color = new THREE.Color(0, 0, 1);
    let mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.blocks[block.id] = mesh;
  }

  private createPlayer(player: Player) {
    let width = PixelsPerSpace;
    let geometry = new THREE.CubeGeometry(width, width, width);
    let material = new THREE.MeshBasicMaterial();
    material.color = new THREE.Color(1, 0, 0);
    let mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.players[player.id] = mesh;
  }

  private updateScene(gameScene: GameScene) {
    console.log('gs', gameScene);
    for (let id in this.blocks) {
      if (true) {
        let match = gameScene.blocks.find(i => i.id.toString() === id);
        this.updateCoordinate(this.blocks[id], match);
      }
    }

    for (let id in this.players) {
      if (true) {
        let match = gameScene.players.find(i => i.id.toString() === id);
        this.updateCoordinate(this.players[id], match);
      }
    }
  }

  private updateCoordinate(mesh: THREE.Mesh, coordinate: Coordinate) {
    mesh.position.x = coordinate.x;
    mesh.position.y = coordinate.y;
    mesh.position.z = coordinate.z;
  }
}
