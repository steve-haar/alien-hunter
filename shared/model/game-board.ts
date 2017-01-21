import { Player } from './player';
import { Coordinate } from './model';
import { GameElement } from './game-element';

export class GameBoard {
	board: GameElement[][];

	constructor(width: number, height: number, public players: Player[]) {
		this.board = [];
		for (let i = 0; i < height; i++) {
			this.board.push(new Array(width));
		}
	}

	static serialize(gameBoard: GameBoard) {
		let result = new GameBoard(1, 1, []);
		result.board = gameBoard.board;
		return result;
	}

	static deserialize(gameBoard: GameBoard) {
		let result = new GameBoard(1, 1, []);
		result.board = gameBoard.board;
		return result;
	}

	move(from: Coordinate, to: Coordinate) {
		console.log('m');
		this.board[to.y][to.x] = this.board[from.y][from.x];
		this.board[from.y][from.x] = undefined;
	}

	getElement(coordinate: Coordinate) {
		return this.board[coordinate.y][coordinate.x];
	}

	isValidCoordinate(coordinate: Coordinate) {
		return coordinate.y >= 0 && coordinate.y < this.board.length && coordinate.x >= 0 && coordinate.x < this.board[0].length;
	}

	setElement(coordinate: Coordinate, element: GameElement) {
		this.board[coordinate.y][coordinate.x] = element;
	}

	getCoordinateById(id: number): Coordinate {
		for (let y = 0; y < this.board.length; y++) {
			for (let x = 0; x < this.board[0].length; x++) {
				let element = this.board[y][x];
				if (element && element.id === id) {
					return new Coordinate(x, y);
				}
			}
		}

		return null;
	}
}
