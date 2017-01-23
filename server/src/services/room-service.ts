import { Player } from './../../../shared/model/player';
import { Room } from './../../../shared/model/room';
import { PlayerType } from './../../../shared/model/enum';

export class RoomService {
	private rooms: Room[] = [];

	public getRoom(roomName: string): Room {
		return this.rooms.find(i => i.getName() === roomName);
	}

	public joinRoom(sessionId: string, playerName: string, roomName: string, password: string) {
		let player = new Player(sessionId, playerName, PlayerType.Hunter);
		let room = this.getOrCreateRoom(player, roomName);
		let canJoin = room.canJoin(playerName, password);
		if (canJoin) {
			room.join(player);
			console.log(`player: ${playerName} joined ${roomName}`);
		} else {
			console.log(`player: ${playerName} can't join ${roomName}; room is locked`);
		}

		return canJoin;
	}

	public leaveRoom(playerName: string, roomName: string) {
		let room = this.getRoom(roomName);

		if (room && room.playerExists(playerName)) {
			room.leave(playerName);
			console.log(`player: ${playerName} left ${room.getName()}`);
			if (room.getExistingPlayerNames().length === 0) {
				this.rooms.splice(this.rooms.indexOf(room), 1);
				console.log(`room: ${room.getName()} has been deleted`);
			}
		}
	}

	public lockRoom(playerName: string, roomName: string) {
		let room = this.getRoom(roomName);
		if (room && room.getHostPlayer().name == playerName) {
			room.lock();
			console.log(`room: ${roomName} locked`);
		} else {
			console.log(`room: ${roomName} not locked (not host)`);
		}
	}

	public unlockRoom(playerName: string, roomName: string) {
		let room = this.getRoom(roomName);
		if (room && room.getHostPlayer().name == playerName) {
			room.unlock();
			console.log(`room: ${roomName} unlocked`);
		} else {
			console.log(`room: ${roomName} not unlocked (not host)`);
		}
	}

	public setPassword(playerName: string, roomName: string, password: string) {
		let room = this.getRoom(roomName);
		if (room && room.getHostPlayer().name == playerName) {
			room.password = password;
			console.log(`password for room ${roomName} is set to ${password}`);
		}
	}

	public updateGameOptions(playerName: string, roomName: string, options: { level: number, bots: number }) {
		let room = this.getRoom(roomName);
		if (room && room.getHostPlayer().name == playerName) {
			room.level = options.level;
			room.bots = options.bots;
			console.log(`level and bots for room ${roomName} is set to ${options.level} and ${options.bots}`);
		}
	}

	public kickPlayer(playerName: string, roomName: string, playerNameToKick: string) {
		let room = this.getRoom(roomName);
		let kicked = false;

		if (room && room.playerExists(playerName)) {
			if (room && room.getHostPlayer().name == playerName) {
				room.leave(playerName);
				console.log(`player: ${playerName} kicked from ${roomName}`);
				kicked = true;
			} else {
				console.log(`player: ${playerName} not kicked from ${roomName} (not host)`);
			}
		}

		return kicked;
	}

	private getOrCreateRoom(hostPlayer: Player, roomName: string): Room {
		let room = this.getRoom(roomName);

		if (room === undefined) {
			room = new Room(hostPlayer, roomName, false);
			this.rooms.push(room);
			console.log(`room: ${room.getName()} has been created`);
		}

		return room;
	}
}
