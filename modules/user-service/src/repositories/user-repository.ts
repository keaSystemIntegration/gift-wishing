import { neo4jConnection } from "../database/neo4j";
import User from "../models/User";


export const userRepository = {
	async getUserById(userId: string): Promise<User | null> {
		// Return user with userId
		const result = await neo4jConnection(
			`MATCH (user:USER {userId: $userId}) RETURN user`,
			{
				userId: userId
			}
		);
		
		return result.records[0].get(0).properties;
	},
	async createUser(user: User): Promise<User | null> {
		const dateString = new Date(new Date().toUTCString()).toISOString();	
		const result = await neo4jConnection(
			`
				CREATE (user:USER {
					userId: $userId, 
					name: $name, 
					username: $username, 
					email: $email, 
					signupDate: $signupDate
				}) RETURN user
			`,
			{
				userId: user.userId,
        name: user.name,
				username: user.username,
        email: user.email,
				signupDate: dateString,
			}
		);
		
		return result.records[0].get(0).properties;
	},
	async updateUser(userId: string, name: string, username: string): Promise<User | null> {
		const result = await neo4jConnection(
			`
				MATCH (user:USER {userId: $userId}) 
				SET 
					user.name = $name, 
					user.username = $username 
				RETURN user
			`,
			{
				userId: userId,
				name: name,
				username: username,
			}
		);
		console.log("result: " + JSON.stringify(result));
		
		return result.records[0].get(0).properties;
	},
	async deleteUser(userId: string): Promise<User | null> {
		const result = await neo4jConnection(
			`
				MATCH (user: USER {userId: $userId})
				WITH user, properties(user) AS m
				DETACH DELETE user
				RETURN m
			`,
			{
				userId: userId
			}
		);

		return result.records[0].get(0).properties;
	},
}

