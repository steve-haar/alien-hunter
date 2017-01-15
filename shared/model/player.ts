import { Coordinate, Direction } from './';

export class Player implements Coordinate {
	queuedDirection: Direction;

	constructor(private sessionId: string, private name: string, public id: number, public x: number, public y: number, public z: number) {
	}

	public static deserialize(input: Player) {
		return new Player(input.sessionId, input.name, input.id, input.x, input.y, input.z);
	}

	public static serialize(input: Player) {
		return input;
	}

	public getSessionId() {
		return this.sessionId;
	}

	public getName() {
		return this.name;
	}

	public setPosition(coordinate: { x, y, z }) {
		this.x = coordinate.x;
		this.y = coordinate.y;
		this.z = coordinate.z;
	}
}
