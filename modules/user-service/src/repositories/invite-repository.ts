import { neo4jConnection } from "../database/neo4j";
import { FriendStatus, getFriendStatus } from "../models/enums/FriendStatus";
import User from "../models/User";




export const inviteRepository = {
	async createTempFriend(userId: string, tempFriend: User): Promise<User | null> {
		const result = await neo4jConnection(
			`
			MATCH (user:USER {userId: $userId})
				CREATE (friend:USER {
					userId: $friendId, 
					name: $friendName,
					username: $friendUsername,
					email: $friendEmail,
					signupDate: $friendSignupDate
				})
			MERGE (user)-[r:FRIENDS_WITH {status: $status, originatorUserId: $userId}]->(friend)
			RETURN user, friend, r
			`,
			{
				userId: userId,
				friendId: tempFriend.userId,
				friendName: tempFriend.name,
				friendUsername: tempFriend.username,
				friendEmail: tempFriend.email,
				friendSignupDate: tempFriend.signupDate.toISOString(),
				status: getFriendStatus("INVITED")
			});
		console.log("Create Temp friend result.records[0].get()" + JSON.stringify(result.records[0].get("friend").properties));
		const dbFriend = result.records[0].get("friend").properties;
		const friend: User = {
			userId: dbFriend.userId,
			name: dbFriend.name,
			username: dbFriend.username,
			email: dbFriend.email,
			signupDate: new Date(dbFriend.signupDate)
		};
		
		return friend;
	},
	async updateTempFriend(inviteFromUserId: string, user: User, tempFriendId: string, oldStatus: FriendStatus, newStatus: FriendStatus): Promise<User | null>{
		const result = await neo4jConnection(
			`
				MATCH (inviteFromUser:USER)-[r:FRIENDS_WITH]-(user:USER)
				WHERE 
					inviteFromUser.userId = $inviteFromUserId AND 
					user.userId = $tempFriendId AND
					r.status = $oldStatus AND
					r.originatorUserId = $inviteFromUserId
				SET
					r.status = $newStatus,
					user.userId = $userId,
					user.name = $name,
					user.username = $username,
					user.signupDate = $signupDate
				RETURN r, user
			`,
			{
				inviteFromUserId: inviteFromUserId,
				tempFriendId: tempFriendId,
				oldStatus: oldStatus,
				newStatus: newStatus,
				userId: user.userId,
				name: user.name,
				username: user.username,
				signupDate: user.signupDate.toISOString(),
			});
		const dbUser = result.records[0].get("user").properties;
		const dbRel = result.records[0].get("r").properties;
		console.log("Updated friend in db:\n" + JSON.stringify(dbUser) + "\nRel:\n" + JSON.stringify(dbRel));
		const userObj: User = {
			userId: dbUser.userId,
			name: dbUser.name,
			username: dbUser.username,
			email: dbUser.username,
			signupDate: new Date(dbUser.signupDate)
		}
		
		return userObj;
	}
}