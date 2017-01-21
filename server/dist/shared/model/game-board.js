"use strict";
const model_1 = require("./model");
class GameBoard {
    constructor(width, height, players) {
        this.players = players;
        this.board = [];
        for (let i = 0; i < height; i++) {
            this.board.push(new Array(width));
        }
    }
    static serialize(gameBoard) {
        let result = new GameBoard(1, 1, []);
        result.board = gameBoard.board;
        return result;
    }
    static deserialize(gameBoard) {
        let result = new GameBoard(1, 1, []);
        result.board = gameBoard.board;
        return result;
    }
    move(from, to) {
        console.log('m');
        this.board[to.y][to.x] = this.board[from.y][from.x];
        this.board[from.y][from.x] = undefined;
    }
    getElement(coordinate) {
        return this.board[coordinate.y][coordinate.x];
    }
    isValidCoordinate(coordinate) {
        return coordinate.y >= 0 && coordinate.y < this.board.length && coordinate.x >= 0 && coordinate.x < this.board[0].length;
    }
    setElement(coordinate, element) {
        this.board[coordinate.y][coordinate.x] = element;
    }
    getCoordinateById(id) {
        for (let y = 0; y < this.board.length; y++) {
            for (let x = 0; x < this.board[0].length; x++) {
                let element = this.board[y][x];
                if (element && element.id === id) {
                    return new model_1.Coordinate(x, y);
                }
            }
        }
        return null;
    }
}
exports.GameBoard = GameBoard;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/shared/model/game-board.js.map