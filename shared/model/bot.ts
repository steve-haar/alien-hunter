import { Direction, PlayerType, ElementType } from './enum';
import { GameElement } from './game-element';

export class Bot extends GameElement {
	randomCount = 0;
	trackingId: number;

	constructor() {
		super(ElementType.Alien);
	}

	public canPushBlocks() {
		return false;
	}
}
