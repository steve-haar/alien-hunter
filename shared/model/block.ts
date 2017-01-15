import { Coordinate } from './';

export class Block implements Coordinate {
	constructor(public color: string, public id: number, public x: number, public y: number, public z: number) {
	}

	public static deserialize(input: Block) {
		return new Block(input.color, input.id, input.x, input.y, input.z);
	}

	public static serialize(input: Block) {
		return input;
	}
}
