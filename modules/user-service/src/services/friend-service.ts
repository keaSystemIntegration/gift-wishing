import { getFriendStatus } from "../models/enums/FriendStatus";
import { friendRepository } from "../repositories/friend-repository";
import Friend from "../models/Friend";


export const friendService = {
	async getAllUserFriendsById(userId: string): Promise<Friend[] | null> {
		const friends: Friend[] = await friendRepository.getAllUserFriendsById(userId);
		return friends;
	},
	async getAllUserFriendsByEmail(email: string): Promise<Friend[] | null> {
		const friends: Friend[] = await friendRepository.getAllUserFriendsByEmail(email);
		return friends;
	},
	async getUserFriendsByStatus(userId: string, status: string): Promise<Friend[] | null> {
		const friendStatus = getFriendStatus(status);
		const friends: Friend[] = await friendRepository.getFriendsByStatus(userId, friendStatus);
		return friends;
	},
}
