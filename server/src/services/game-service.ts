import { Player, Room, Block, GameScene, Direction } from './../../../shared/model/';

export class GameService {
	private gameScenes = {};

	public startGame(room: Room) {
		room.players[0].id = 1;
		room.players[0].x = 50;
		room.players[0].y = 50;
		this.gameScenes[room.getName()] = new GameScene(room.players, [new Block('#f00', 1, 0, 0, 0)]);
	}

	public updateScene(roomName: string) {
		let gameScene = this.getGameScene(roomName);
		gameScene.players.map(i => this.movePlayer(gameScene, i));
	}

	public move(roomName: string, playerName: string, direction: Direction) {
		let gameScene = this.getGameScene(roomName);
		let player = this.getPlayer(gameScene, playerName);
		player.queuedDirection = direction;
	}

	public getGameScene(roomName: string): GameScene {
		return this.gameScenes[roomName];
	}

	private getPlayer(gameScene: GameScene, playerName: string) {
		return gameScene.players.find(i => i.getName() === playerName);
	}

	private movePlayer(gameScene: GameScene, player: Player) {
		let oldPosition = { x: player.x, y: player.y, z: player.z };
		let newPosition = undefined;
		switch (player.queuedDirection) {
			case Direction.Up:
				newPosition = oldPosition;
				newPosition.y+=1;
				break;
			case Direction.Down:
				newPosition = oldPosition;
				newPosition.y-=1;
				break;
			case Direction.Left:
				newPosition = oldPosition;
				newPosition.x-=1;
				break;
			case Direction.Right:
				newPosition = oldPosition;
				newPosition.x+=1;
				break;
		}

		if (newPosition) {
			player.setPosition(newPosition);
		}
	}
}
