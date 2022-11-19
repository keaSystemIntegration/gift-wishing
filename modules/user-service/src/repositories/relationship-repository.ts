import { neo4jConnection } from "../database/neo4j";
import { FriendStatus, getFriendStatus } from "../models/enums/FriendStatus";
import Friend from "../models/Friend";


export const relationshipRepository = {
	async createRelationship (userId: string, friendId: string): Promise<Friend | null> {
		const friendStatus: string = FriendStatus.REQUESTED
		const result = await neo4jConnection(
			`
			MATCH
				(a:USER),
				(b:USER)
			WHERE a.userId = $userId AND b.userId = $friendId
			CREATE (a)-[r:FRIENDS_WITH {status: $status, originatorUserId: $userId}]->(b)
			RETURN a, b, r
			`,
			{
				userId: userId,
				friendId: friendId,
				status: friendStatus
			})
		const friendProperties = result.records[0].get("b").properties;
		const friend: Friend = {
			friendId: friendProperties.userId,
			friendName: friendProperties.name,
			friendEmail: friendProperties.email,
			friendStatus: getFriendStatus(result.records[0].get("r").properties.status)
		}

		return friend;
	},
	async updateRelationship(userId: string, friendId: string, friendStatus: FriendStatus): Promise<Friend | null> {
		const result = await neo4jConnection(
			`
				MATCH (user:USER)-[r:FRIENDS_WITH]-(friend:USER)
				WHERE user.userId = $userId AND friend.userId = $friendId
				SET r.status = $status
				RETURN friend, r
			`,
			{
				userId: userId,
				friendId: friendId,
				status: friendStatus
			});
		const friendProperties = result.records[0].get("friend").properties;
		const friendRelationship = result.records[0].get("r").properties;
		const friendObj: Friend = {
			friendId: friendProperties.userId,
			friendName: friendProperties.name,
			friendEmail: friendProperties.email,
			friendStatus: friendRelationship.status
		}

		return friendObj;
	},
	async deleteRelationship(userId: string, friendId: string): Promise<boolean> {
		const result = await neo4jConnection(
			`
				MATCH (user:USER)-[r:FRIENDS_WITH]-(friend:USER)
				WHERE user.userId = $userId AND friend.userId = $friendId
				DELETE r
				RETURN user
			`,
			{
				userId: userId,
				friendId: friendId
			});
		if(result.records[0].get("user").properties){
			return true;
		} else {
			return false;
		}
	}
}
