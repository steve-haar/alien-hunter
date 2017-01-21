import { Player } from './player';

export class Room {
	public password: string;
	public players: Player[] = [];
	public isHostAction: boolean;

	constructor(
		public hostPlayer: Player,
		public roomName: string,
		public locked: boolean) {
	}

	public static deserialize(input: Room) {
		if (input) {
			let room = new Room(input.hostPlayer, input.roomName, input.locked);
			room.players = input.players;
			room.isHostAction = input.isHostAction;
			return room;
		} else {
			return null;
		}
	}

	public static serialize(input: Room, isHostAction: boolean) {
		return input;
	}

	public getHostPlayer() {
		return this.hostPlayer;
	}

	public getName() {
		return this.roomName;
	}

	public getExistingPlayerNames() {
		return this.players.map(i => i.name);
	}

	public playerExists(playerName: string) {
		return !!this.players.find(i => i.name === playerName);
	}

	public isLocked() {
		return this.locked;
	}

	public canJoin(playerName: string, password: string) {
		let exists = this.players.find(i => i.name === playerName);
		return playerName && !exists &&
			(this.isLocked() === false
			|| this.hostPlayer.name === playerName
			|| this.password && this.password === password);
	}

	public lock() {
		this.locked = true;
	}

	public unlock() {
		this.locked = false;
	}

	public join(player: Player) {
		this.players.push(player);
	}

	public leave(playerName: string) {
		let player = this.players.find(i => i.name === playerName);
		if (player) {
			this.players.splice(this.players.indexOf(player), 1);
		}
	}
}
