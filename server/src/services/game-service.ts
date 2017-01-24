import { Player } from './../../../shared/model/player';
import { Bot } from './../../../shared/model/bot';
import { Block } from './../../../shared/model/block';
import { Room } from './../../../shared/model/room';
import { GameBoard } from './../../../shared/model/game-board';
import { GameElement } from './../../../shared/model/game-element';
import { Direction, ElementType, InitialSpaceType, PlayerType } from './../../../shared/model/enum';
import { Coordinate, InitialSpace } from './../../../shared/model/model';
import { Levels } from './levels';

const GameWidth = 40;
const GameHeight = 30;

const MaxX = GameWidth - 1;
const MinX = 0;
const MaxY = GameHeight - 1;
const MinY = 0;

const BotCourseChange = 4;
const BotRandomMoveCount = 12;

export class GameService {
	private levels = new Levels();
	private gameBoards: { [propName: string]: GameBoard } = {};

	public startGame(room: Room) {
		let bots = this.getBots(room);
		this.gameBoards[room.getName()] = new GameBoard(GameWidth, GameHeight, room.players, bots);
		let initialSpaces = this.getInitialSpaces(room.level);
		this.spawnPlayers(room, initialSpaces);
		this.spawnBots(room, initialSpaces);
		this.spawnBlocks(room, initialSpaces);
	}

	public moveHunters(roomName: string) {
		let gameBoard = this.getGameBoard(roomName);
		gameBoard.players
			.filter(player => player.playerType === PlayerType.Hunter)
			.map(player => this.movePlayer(gameBoard, player));
	}

	public moveAliens(roomName: string) {
		let gameBoard = this.getGameBoard(roomName);
		gameBoard.players
			.filter(player => player.playerType === PlayerType.Alien)
			.map(player => this.movePlayer(gameBoard, player));
	}

	public moveBots(roomName: string) {
		let gameBoard = this.getGameBoard(roomName);
		gameBoard.bots
			.map(bot => this.moveBot(gameBoard, bot));
	}

	public move(roomName: string, playerName: string, direction: Direction) {
		let gameBoard = this.getGameBoard(roomName);
		let player = this.getPlayer(gameBoard, playerName);
		player.queuedDirection = direction;
	}

	public getGameBoard(roomName: string): GameBoard {
		return this.gameBoards[roomName];
	}

	private getBots(room: Room) {
		let bots = [];
		for (let i = 0; i < room.bots; i++) {
			bots.push(new Bot());
		}

		return bots;
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

	private spawnBots(room: Room, initialSpaces: InitialSpace[]) {
		let gameBoard = this.gameBoards[room.getName()];
		let botSpawnPoints = initialSpaces
			.filter(s => s.type === InitialSpaceType.AlienSpawn || s.type === InitialSpaceType.BothSpawn)
			.filter(s => gameBoard.getElement(s) === undefined);

		for (let bot of gameBoard.bots) {
			let index = Math.floor(Math.random() * botSpawnPoints.length);
			let spawnPoint = botSpawnPoints.splice(index, 1)[0];
			gameBoard.setElement(new Coordinate(spawnPoint.x, spawnPoint.y), bot);
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
		let newPosition = this.getPositionOfMove(oldPosition, player.queuedDirection);

		if (newPosition) {
			let element = gameBoard.getElement(newPosition);
			if (element === undefined) {
				gameBoard.move(oldPosition, newPosition);
			} else if (element.type === ElementType.Block) {
				this.pushBlocks(gameBoard, player, newPosition);
			}
		}
	}

	private moveBot(gameBoard: GameBoard, bot: Bot) {
		let botCoordinate = gameBoard.getCoordinateById(bot.id);
		let hunters = gameBoard.players.filter(i => i.playerType === PlayerType.Hunter);

		if (bot.randomCount === 0) {
			let distances = hunters.map(hunter => { return { id: hunter.id, distance: this.getDistance(gameBoard, bot, hunter) }; });
			distances.sort((a, b) => a.distance - b.distance);
			let nearestHunter = distances[0];
			let trackingHunter = distances.find(i => i.id === bot.trackingId);
			if (!!!trackingHunter || (nearestHunter !== trackingHunter && nearestHunter.distance + BotCourseChange < trackingHunter.distance)) {
				bot.trackingId = nearestHunter.id;
			}

			let preyCoordinate = gameBoard.getCoordinateById(bot.trackingId);
			let xDistance = preyCoordinate.x - botCoordinate.x;
			let yDistance = preyCoordinate.y - botCoordinate.y;
			let moves = [];
			if (Math.abs(xDistance) >= Math.abs(yDistance)) {
				moves.push(xDistance > 0 ? Direction.Right : Direction.Left);
				if (yDistance > 0) {
					moves.push(Direction.Down);
				} else if (yDistance < 0) {
					moves.push(Direction.Up);
				}
				moves.push(yDistance > 0 ? Direction.Down : Direction.Up);
			} else {
				moves.push(yDistance > 0 ? Direction.Down : Direction.Up);
				if (xDistance > 0) {
					moves.push(Direction.Right);
				} else if (xDistance < 0) {
					moves.push(Direction.Left);
				}
			}

			let moved = false;
			for (let i = 0; i < 4; i++) {
				let newPosition = this.getPositionOfMove(botCoordinate, moves[i]);
				if (newPosition && gameBoard.getElement(newPosition) === undefined) {
					gameBoard.move(botCoordinate, newPosition);
					moved = true;
					break;
				}
			}

			if (moved == false) {
				bot.trackingId = null;
				bot.randomCount = BotRandomMoveCount;
			}
		}

		if (bot.randomCount > 0) {
			bot.randomCount--;
			let moves = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
			for (let i = 0; i < 4; i++) {
				let move = moves.splice(Math.floor(Math.random() * moves.length), 1);
				let newPosition = this.getPositionOfMove(botCoordinate, moves[i]);
				if (newPosition && gameBoard.getElement(newPosition) === undefined) {
					gameBoard.move(botCoordinate, newPosition);
					break;
				}
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

	private getDistance(gameBoard: GameBoard, elementA: GameElement, elementB: GameElement) {
		let a = gameBoard.getCoordinateById(elementA.id);
		let b = gameBoard.getCoordinateById(elementB.id);
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	private getPositionOfMove(position: Coordinate, direction: Direction) {
		let newPosition: Coordinate = undefined;
		switch (direction) {
			case Direction.Up:
				if (position.y > MinY) {
					newPosition = new Coordinate(position.x, position.y);
					newPosition.y -= 1;
				}
				break;
			case Direction.Down:
				if (position.y < MaxY) {
					newPosition = new Coordinate(position.x, position.y);
					newPosition.y += 1;
				}
				break;
			case Direction.Left:
				if (position.x > MinX) {
					newPosition = new Coordinate(position.x, position.y);
					newPosition.x -= 1;
				}
				break;
			case Direction.Right:
				if (position.x < MaxX) {
					newPosition = new Coordinate(position.x, position.y);
					newPosition.x += 1;
				}
				break;
		}

		return newPosition;
	}
}
