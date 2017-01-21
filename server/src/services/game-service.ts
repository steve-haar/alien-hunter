import { Player } from './../../../shared/model/player';
import { Block } from './../../../shared/model/block';
import { Room } from './../../../shared/model/room';
import { GameBoard } from './../../../shared/model/game-board';
import { GameElement } from './../../../shared/model/game-element';
import { Direction, ElementType, InitialSpaceType } from './../../../shared/model/enum';
import { Coordinate, InitialSpace } from './../../../shared/model/model';
import { Levels } from './levels';

const GameWidth = 40;
const GameHeight = 30;

const MaxX = GameWidth - 1;
const MinX = 0;
const MaxY = GameHeight - 1;
const MinY = 0;

export class GameService {
	private levels = new Levels();
	private gameBoards: { [propName: string]: GameBoard } = {};

	public startGame(room: Room, level: number) {
		this.gameBoards[room.getName()] = new GameBoard(GameWidth, GameHeight, room.players);
		let initialSpaces = this.getInitialSpaces(level);
		this.spawnPlayers(room, initialSpaces);
		this.spawnBlocks(room, initialSpaces);
	}

	public updateGame(roomName: string) {
		let gameBoard = this.getGameBoard(roomName);
		gameBoard.players.map(player => this.movePlayer(gameBoard, player));
	}

	public move(roomName: string, playerName: string, direction: Direction) {
		let gameBoard = this.getGameBoard(roomName);
		let player = this.getPlayer(gameBoard, playerName);
		player.queuedDirection = direction;
	}

	public getGameBoard(roomName: string): GameBoard {
		return this.gameBoards[roomName];
	}

	private getInitialSpaces(level: number): InitialSpace[] {
		return this.levels.getLevel(level)
			.map((row, rowIndex) => row.map((column, columnIndex) => new InitialSpace(columnIndex, rowIndex, row[columnIndex])))
			.reduce((a, b) => a.concat(b));
	}

	private getPlayer(gameBoard: GameBoard, playerName: string) {
		return gameBoard.players.find(i => i.name === playerName);
	}

	private spawnPlayers(room: Room, initialSpaces: InitialSpace[]) {
		let gameBoard = this.getGameBoard(room.getName());
		let hunterSpawnPoints = initialSpaces.filter(s => s.type === InitialSpaceType.BothSpawn || s.type === InitialSpaceType.HunterSpawn);

		for (let player of room.players) {
			let index = Math.floor(Math.random() * hunterSpawnPoints.length);
			let spawnPoint = hunterSpawnPoints.splice(index, 1)[0];
			gameBoard.setElement(new Coordinate(spawnPoint.x, spawnPoint.y), player);
		}
	}

	private spawnBlocks(room: Room, initialSpaces: InitialSpace[]) {
		let gameBoard = this.gameBoards[room.getName()];
		let blockSpawnPoints = initialSpaces.filter(s => s.type === InitialSpaceType.Block);

		for (let spawnPoint of blockSpawnPoints) {
			let block = new Block('');
			gameBoard.setElement(new Coordinate(spawnPoint.x, spawnPoint.y), block);
		}
	}

	private movePlayer(gameBoard: GameBoard, player: Player) {
		let oldPosition = gameBoard.getCoordinateById(player.id);
		let newPosition: Coordinate = undefined;
		switch (player.queuedDirection) {
			case Direction.Up:
				if (oldPosition.y > MinY) {
					newPosition = new Coordinate(oldPosition.x, oldPosition.y);
					newPosition.y -= 1;
				}
				break;
			case Direction.Down:
				if (oldPosition.y < MaxY) {
					newPosition = new Coordinate(oldPosition.x, oldPosition.y);
					newPosition.y += 1;
				}
				break;
			case Direction.Left:
				if (oldPosition.x > MinX) {
					newPosition = new Coordinate(oldPosition.x, oldPosition.y);
					newPosition.x -= 1;
				}
				break;
			case Direction.Right:
				if (oldPosition.x < MaxX) {
					newPosition = new Coordinate(oldPosition.x, oldPosition.y);
					newPosition.x += 1;
				}
				break;
		}

		if (newPosition) {
			let element = gameBoard.getElement(newPosition);
			if (element === undefined) {
				gameBoard.move(oldPosition, newPosition);
			} else if (element.type === ElementType.Block) {
				this.pushBlocks(gameBoard, player, newPosition);
			}
		}
	}

	private pushBlocks(gameBoard: GameBoard, player: Player, position: Coordinate) {
		if (player.canPushBlocks()) {
			let xDirection = 0, yDirection = 0;
			switch (player.queuedDirection) {
				case Direction.Up:
					yDirection--;
					break;
				case Direction.Down:
					yDirection++;
					break;
				case Direction.Left:
					xDirection--;
					break;
				case Direction.Right:
					xDirection++;
					break;
			}

			let newPositionElement: GameElement;
			let moves = 0;
			do {
				position.y += yDirection;
				position.x += xDirection;
				newPositionElement = gameBoard.isValidCoordinate(position) && gameBoard.getElement(position);
			} while (newPositionElement && newPositionElement.type === ElementType.Block);

			if (newPositionElement === undefined) {
				let prevPosition = new Coordinate(position.x - xDirection, position.y - yDirection);
				do {
					gameBoard.move(prevPosition, position);
					position.x -= xDirection;
					position.y -= yDirection;
					prevPosition = new Coordinate(position.x - xDirection, position.y - yDirection);
				} while (gameBoard.getElement(prevPosition) && gameBoard.getElement(prevPosition).type === ElementType.Block);

				gameBoard.move(prevPosition, position);
			}
		}
	}
}
