"use strict";
const bot_1 = require("./../../../shared/model/bot");
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
const BotCourseChange = 4;
const BotRandomMoveCount = 4;
class GameService {
    constructor() {
        this.levels = new levels_1.Levels();
        this.gameBoards = {};
    }
    startGame(room) {
        let bots = this.getBots(room);
        this.gameBoards[room.getName()] = new game_board_1.GameBoard(GameWidth, GameHeight, room.players, bots);
        let initialSpaces = this.getInitialSpaces(room.level);
        this.spawnPlayers(room, initialSpaces);
        this.spawnBots(room, initialSpaces);
        this.spawnBlocks(room, initialSpaces);
    }
    moveHunters(roomName) {
        let gameBoard = this.getGameBoard(roomName);
        gameBoard.players
            .filter(player => player.playerType === enum_1.PlayerType.Hunter)
            .map(player => this.movePlayer(gameBoard, player));
    }
    moveAliens(roomName) {
        let gameBoard = this.getGameBoard(roomName);
        gameBoard.players
            .filter(player => player.playerType === enum_1.PlayerType.Alien)
            .map(player => this.movePlayer(gameBoard, player));
    }
    moveBots(roomName) {
        let gameBoard = this.getGameBoard(roomName);
        gameBoard.bots
            .map(bot => this.moveBot(gameBoard, bot));
    }
    move(roomName, playerName, direction) {
        let gameBoard = this.getGameBoard(roomName);
        let player = this.getPlayer(gameBoard, playerName);
        player.queuedDirection = direction;
    }
    getGameBoard(roomName) {
        return this.gameBoards[roomName];
    }
    getBots(room) {
        let bots = [];
        for (let i = 0; i < room.bots; i++) {
            bots.push(new bot_1.Bot());
        }
        return bots;
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
    spawnBots(room, initialSpaces) {
        let gameBoard = this.gameBoards[room.getName()];
        let botSpawnPoints = initialSpaces
            .filter(s => s.type === enum_1.InitialSpaceType.AlienSpawn || s.type === enum_1.InitialSpaceType.BothSpawn)
            .filter(s => gameBoard.getElement(s) === undefined);
        for (let bot of gameBoard.bots) {
            let index = Math.floor(Math.random() * botSpawnPoints.length);
            let spawnPoint = botSpawnPoints.splice(index, 1)[0];
            gameBoard.setElement(new model_1.Coordinate(spawnPoint.x, spawnPoint.y), bot);
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
        let newPosition = this.getPositionOfMove(oldPosition, player.queuedDirection);
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
    moveBot(gameBoard, bot) {
        let botCoordinate = gameBoard.getCoordinateById(bot.id);
        let hunters = gameBoard.players.filter(i => i.playerType === enum_1.PlayerType.Hunter);
        if (bot.randomCount === 0) {
            let distances = hunters.map(hunter => { return { id: hunter.id, distance: this.getDistance(gameBoard, bot, hunter) }; });
            distances.sort((a, b) => a.distance - b.distance);
            let nearestHunter = distances[0];
            let trackingHunter = distances.find(i => i.id === bot.trackingId);
            if (!!trackingHunter || (nearestHunter !== trackingHunter && nearestHunter.distance + BotCourseChange < trackingHunter.distance)) {
                bot.trackingId = nearestHunter.id;
            }
            let preyCoordinate = gameBoard.getCoordinateById(bot.trackingId);
            let xDistance = Math.abs(preyCoordinate.x - botCoordinate.x);
            let yDistance = Math.abs(preyCoordinate.y - botCoordinate.y);
            let moves = xDistance >= yDistance ? [enum_1.Direction.Left, enum_1.Direction.Right, enum_1.Direction.Up, enum_1.Direction.Down] : [enum_1.Direction.Up, enum_1.Direction.Down, enum_1.Direction.Left, enum_1.Direction.Right];
            let moved = false;
            for (let i = 0; i < 4; i++) {
                let newPosition = this.getPositionOfMove(botCoordinate, moves[i]);
                if (gameBoard.getElement(newPosition) === undefined) {
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
            let moves = [enum_1.Direction.Up, enum_1.Direction.Down, enum_1.Direction.Left, enum_1.Direction.Right];
            for (let i = 0; i < 4; i++) {
                let move = moves.splice(Math.floor(Math.random() * moves.length));
                let newPosition = this.getPositionOfMove(botCoordinate, moves[i]);
                if (gameBoard.getElement(newPosition) === undefined) {
                    gameBoard.move(botCoordinate, newPosition);
                    break;
                }
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
    getDistance(gameBoard, elementA, elementB) {
        let a = gameBoard.getCoordinateById(elementA.id);
        let b = gameBoard.getCoordinateById(elementB.id);
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    getPositionOfMove(position, direction) {
        let newPosition = undefined;
        switch (direction) {
            case enum_1.Direction.Up:
                if (position.y > MinY) {
                    newPosition = new model_1.Coordinate(position.x, position.y);
                    newPosition.y -= 1;
                }
                break;
            case enum_1.Direction.Down:
                if (position.y < MaxY) {
                    newPosition = new model_1.Coordinate(position.x, position.y);
                    newPosition.y += 1;
                }
                break;
            case enum_1.Direction.Left:
                if (position.x > MinX) {
                    newPosition = new model_1.Coordinate(position.x, position.y);
                    newPosition.x -= 1;
                }
                break;
            case enum_1.Direction.Right:
                if (position.x < MaxX) {
                    newPosition = new model_1.Coordinate(position.x, position.y);
                    newPosition.x += 1;
                }
                break;
        }
        return newPosition;
    }
}
exports.GameService = GameService;
//# sourceMappingURL=C:/Github/steve-haar/alien-hunter/server/src/server/src/services/game-service.js.map