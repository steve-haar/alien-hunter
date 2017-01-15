import { Player } from './';

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
			let room = new Room(Player.deserialize(input.hostPlayer), input.roomName, input.locked);
			room.players = input.players.map(player => Player.deserialize(player));
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
		return this.players.map(i => i.getName());
	}

	public playerExists(playerName: string) {
		return !!this.players.find(i => i.getName() === playerName);
	}

	public isLocked() {
		return this.locked;
	}

	public canJoin(playerName: string, password: string) {
		let exists = this.players.find(i => i.getName() === playerName);
		return playerName && !exists &&
			(this.isLocked() === false
			|| this.hostPlayer.getName() === playerName
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
		let player = this.players.find(i => i.getName() === playerName);
		if (player) {
			this.players.splice(this.players.indexOf(player), 1);
		}
	}
}
