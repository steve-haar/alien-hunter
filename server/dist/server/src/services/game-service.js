"use strict";
const block_1 = require("./../../../shared/model/block");
const game_board_1 = require("./../../../shared/model/game-board");
const enum_1 = require("./../../../shared/model/enum");
const model_1 = require("./../../../shared/model/model");
const levels_1 = require("./levels");
const GameWidth = 40;
const GameHeight = 30;
const MaxX = GameWidth - 1;
const MinX = 0;
const MaxY = GameHeight - 1;
const MinY = 0;
class GameService {
    constructor() {
        this.levels = new levels_1.Levels();
        this.gameBoards = {};
    }
    startGame(room, level) {
        this.gameBoards[room.getName()] = new game_board_1.GameBoard(GameWidth, GameHeight, room.players);
        let initialSpaces = this.getInitialSpaces(level);
        this.spawnPlayers(room, initialSpaces);
        this.spawnBlocks(room, initialSpaces);
    }
    updateGame(roomName) {
        let gameBoard = this.getGameBoard(roomName);
        gameBoard.players.map(player => this.movePlayer(gameBoard, player));
    }
    move(roomName, playerName, direction) {
        let gameBoard = this.getGameBoard(roomName);
        let player = this.getPlayer(gameBoard, playerName);
        player.queuedDirection = direction;
    }
    getGameBoard(roomName) {
        return this.gameBoards[roomName];
    }
    getInitialSpaces(level) {
        return this.levels.getLevel(level)
            .map((row, rowIndex) => row.map((column, columnIndex) => new model_1.InitialSpace(columnIndex, rowIndex, row[columnIndex])))
            .reduce((a, b) => a.concat(b));
    }
    getPlayer(gameBoard, playerName) {
        return gameBoard.players.find(i => i.name === playerName);
    }
    spawnPlayers(room, initialSpaces) {
        let gameBoard = this.getGameBoard(room.getName());
        let hunterSpawnPoints = initialSpaces.filter(s => s.type === enum_1.InitialSpaceType.BothSpawn || s.type === enum_1.InitialSpaceType.HunterSpawn);
        for (let player of room.players) {
            let index = Math.floor(Math.random() * hunterSpawnPoints.length);
            let spawnPoint = hunterSpawnPoints.splice(index, 1)[0];
            gameBoard.setElement(new model_1.Coordinate(spawnPoint.x, spawnPoint.y), player);
        }
    }
    spawnBlocks(room, initialSpaces) {
        let gameBoard = this.gameBoards[room.getName()];
        let blockSpawnPoints = initialSpaces.filter(s => s.type === enum_1.InitialSpaceType.Block);
        for (let spawnPoint of blockSpawnPoints) {
            let block = new block_1.Block('');
            gameBoard.setElement(new model_1.Coordinate(spawnPoint.x, spawnPoint.y), block);
        }
    }
    movePlayer(gameBoard, player) {
        let oldPosition = gameBoard.getCoordinateById(player.id);
        let newPosition = undefined;
        switch (player.queuedDirection) {
            case enum_1.Direction.Up:
                if (oldPosition.y > MinY) {
                    newPosition = new model_1.Coordinate(oldPosition.x, oldPosition.y);
                    newPosition.y -= 1;
                }
                break;
            case enum_1.Direction.Down:
                if (oldPosition.y < MaxY) {
                    newPosition = new model_1.Coordinate(oldPosition.x, oldPosition.y);
                    newPosition.y += 1;
                }
                break;
            case enum_1.Direction.Left:
                if (oldPosition.x > MinX) {
                    newPosition = new model_1.Coordinate(oldPosition.x, oldPosition.y);
                    newPosition.x -= 1;
                }
                break;
            case enum_1.Direction.Right:
                if (oldPosition.x < MaxX) {
                    newPosition = new model_1.Coordinate(oldPosition.x, oldPosition.y);
                    newPosition.x += 1;
                }
                break;
        }
        if (newPosition) {
            let element = gameBoard.getElement(newPosition);
            if (element === undefined) {
                gameBoard.move(oldPosition, newPosition);
            }
            else if (element.type === enum_1.ElementType.Block) {
                this.pushBlocks(gameBoard, player, newPosition);
            }
        }
    }
    pushBlocks(gameBoard, player, position) {
        if (player.canPushBlocks()) {
            let xDirection = 0, yDirection = 0;
            switch (player.queuedDirection) {
                case enum_1.Direction.Up:
                    yDirection--;
                    break;
                case enum_1.Direction.Down:
                    yDirection++;
                    break;
                case enum_1.Direction.Left:
                    xDirection--;
                    break;
                case enum_1.Direction.Right:
                    xDirection++;
                    break;
            }
            let newPositionElement;
            let moves = 0;
            do {
                position.y += yDirection;
                position.x += xDirection;
                newPositionElement = gameBoard.isValidCoordinate(position) && gameBoard.getElement(position);
            } while (newPositionElement && newPositionElement.type === enum_1.ElementType.Block);
            if (newPositionElement === undefined) {
                let prevPosition = new model_1.Coordinate(position.x - xDirection, position.y - yDirection);
                do {
                    gameBoard.move(prevPosition, position);
                    position.x -= xDirection;
                    position.y -= yDirection;
                    prevPosition = new model_1.Coordinate(position.x - xDirection, position.y - yDirection);
                } while (gameBoard.getElement(prevPosition) && gameBoard.getElement(prevPosition).type === enum_1.ElementType.Block);
                gameBoard.move(prevPosition, position);
            }
        }
    }
}
exports.GameService = GameService;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/services/game-service.js.map