import { ElementType } from './enum';

export class GameElement {
	static _id = 0;
	id: number;

	constructor(public type: ElementType) {
		this.id = GameElement._id++;
	}
}
