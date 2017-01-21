import { Direction, PlayerType, ElementType } from './enum';
import { GameElement } from './game-element';

export class Player extends GameElement {
	queuedDirection: Direction;

	constructor(public sessionId: string, public name: string, public playerType: PlayerType) {
		super(playerType === PlayerType.Alien ? ElementType.Alien : ElementType.Hunter);
	}

	public canPushBlocks() {
		return this.playerType === PlayerType.Hunter;
	}
}
