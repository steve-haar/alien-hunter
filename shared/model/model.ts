import { InitialSpaceType } from './enum';

export class Coordinate {
	constructor(public x: number, public y: number) {

	}
}

export class InitialSpace {
	constructor(public x: number, public y: number, public type: InitialSpaceType) {

	}
}
