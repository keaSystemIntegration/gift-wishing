import User from "../models/User";
import { userRepository } from "../repositories/user-repository";
import { isEmail } from "../validation/input-validation";
import { friendService } from "./friend-service";

export const userService = {
	async getUserById(userId: string): Promise<User | null> {
		const user = await userRepository.getUserById(userId);
		return user;
	},
	async getUserAndFriendsById(userId: string): Promise<User | null> {
		const user = await userRepository.getUserById(userId);
		const friends = await friendService.getAllUserFriendsById(userId);
		if(!user || !friends){
			throw new Error("Something went wrong, either get user or get friends failed!");
		}
		user.friends = friends;
		return user;
	},
	async createUser(userId: string, name: string, username: string, email: string): Promise<User | null> {
		if(!isEmail(email)){
			return null;
		}
		const today = new Date(new Date().toUTCString());
		
		const user: User = {
			userId: userId,
			name: name,
			username: username,
			email: email,
			signupDate: today,
		}
		return userRepository.createUser(user);
	},
	async updateUser(userId: string, name: string, username: string): Promise<User | null> {
		if(!userId){
      return null;
    }
		return userRepository.updateUser(userId, name, username);
	},
	async deleteUser(userId: string): Promise<User | null> {
		const user = await userRepository.deleteUser(userId);
		return user;
	},
}
