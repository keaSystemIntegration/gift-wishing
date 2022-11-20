import { getFriendStatus } from "../models/enums/FriendStatus";
import Friend from "../models/Friend";
import { relationshipRepository } from "../repositories/relationship-repository";


export const relationshipService = {
	async createRelationship(userId: string, friendId: string): Promise<Friend | null> {
		const repoResponse = await relationshipRepository.createRelationship(userId, friendId);
		return repoResponse;
	},
	async updateRelationship(userId: string, friendId: string, friendStatus: string): Promise<Friend | null> {
		const status = getFriendStatus(friendStatus);
		const repoResponse = await relationshipRepository.updateRelationship(userId, friendId, status);
		return repoResponse;
	},
	async deleteRelationship(userId: string, friendId: string): Promise<boolean> {
		const repoResponse = await relationshipRepository.deleteRelationship(userId, friendId);
		return repoResponse;
	}
}
