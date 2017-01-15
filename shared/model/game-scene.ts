import { Block, Player } from './';

export class GameScene {
	constructor(public players: Player[], public blocks: Block[]) { }

	public static deserialize(input: GameScene) {
		return new GameScene(input.players.map(i => Player.deserialize(i)), input.blocks.map(i => Block.deserialize(i)));
	}

	public static serialize(input: GameScene) {
		return input;
	}
}
