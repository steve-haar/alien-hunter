import { ElementType } from './enum';
import { GameElement } from './game-element';

export class Block extends GameElement {
	constructor(public color: string) {
		super(ElementType.Block);
	}
}
