import { neo4jConnection } from "../database/neo4j";
import { FriendStatus, getFriendStatus } from "../models/enums/FriendStatus";
import Friend from "../models/Friend";
import User from "../models/User";


export const friendRepository = {
	async getAllUserFriendsByEmail(email: string): Promise<Friend[] | null> {
		const result = await neo4jConnection(
			`
				MATCH (user:USER)-[r:FRIENDS_WITH]-(friend)
				WHERE user.email = $email
				RETURN user, r, friend
			`,
			{
				email: email
			});
		const friends: Friend[] = [];
		result.records.forEach((e, i) => {
			const user = e.get("user").properties;
			const relationship = e.get("r").properties;
			const friend = e.get("friend").properties;
			const friendObj: Friend = {
				friendId: friend.userId,
				friendName: friend.name,
				friendEmail: friend.email,
				friendStatus: getFriendStatus(relationship.status)
			}
			if(relationship.status === FriendStatus.REQUESTED) {
				friendObj.requestedBy = relationship.originatorUserId
			}
			if(user.email !== email){
				console.log("********************************")
				console.log("user.email is not of original user! ")
				console.log("********************************")
			}
			friends.push(friendObj);
		});

		return friends;
	},
	async getAllUserFriendsById(userId: string): Promise<Friend[] | null> {
		const result = await neo4jConnection(
			`
				MATCH (user:USER)-[r:FRIENDS_WITH]-(friend)
				WHERE user.userId = $userId
				RETURN user, r, friend
			`,
			{
				userId: userId
			});

		const friends: Friend[] = [];
		result.records.forEach((e, i) => {
			const user = e.get("user").properties;
			const relationship = e.get("r").properties;
			const friend = e.get("friend").properties;
			const friendObj: Friend = {
				friendId: friend.userId,
				friendName: friend.name,
				friendEmail: friend.email,
				friendStatus: getFriendStatus(relationship.status)
			}
			if(relationship.status === FriendStatus.REQUESTED) {
				friendObj.requestedBy = relationship.originatorUserId
			}
			if(user.userId !== userId){
				console.log("********************************")
				console.log("userId is not of original user! ")
				console.log("********************************")
			}
			friends.push(friendObj);
		});

		return friends;
	},
	async getFriendsByStatus(userId: string, status: FriendStatus): Promise<Friend[] | null> {
		const result = await neo4jConnection(
			`
				MATCH (user:USER)-[r:FRIENDS_WITH]-(friend)
				WHERE user.userId = $userId AND r.status = $status
				RETURN friend, r
			`,
			{
				userId: userId,
				status: status
			});
		const friends: Friend[] = [];
		result.records.forEach(e => {
			const friend = e.get("friend").properties;
			const relationship = e.get("r").properties;

			const friendObj: Friend = {
				friendId: friend.userId,
				friendName: friend.name,
				friendEmail: friend.email,
				friendStatus: getFriendStatus(relationship.status),
			}
			if(relationship.status === FriendStatus.REQUESTED) {
				friendObj.requestedBy = relationship.originatorUserId
			}

			friends.push(friendObj);
		});
		return friends;
 	},
}
