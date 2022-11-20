import { createToken, getTokenObject } from "./jwt-service";
import { userService } from "./user-service";
import { v4 as uuid } from "uuid";
import User from "../models/User";
import InviteToken from "../models/InviteToken";
import { inviteRepository } from "../repositories/invite-repository";
import { sendEmailToEmailServer } from "./email-server-service";
import { getFriendStatus } from "../models/enums/FriendStatus";


export const inviteService = {
	async sendInvitation(userId: string, friendEmail: string): Promise<boolean> {
		const inviteTokenObject: InviteToken = {
			inviteUserId: userId,
			friendEmail: friendEmail,
			friendId: uuid()
		}
		const token = createToken(inviteTokenObject);
		const inviteFromUser = await userService.getUserById(userId);
		if(!inviteFromUser) {
			throw new Error('userId sending invitation was not found!');
		}
		const dateString = new Date().toUTCString();	
		const tempFriend: User = {
			userId: inviteTokenObject.friendId,
			name: "TEMP_"+friendEmail,
			username: "TEMP_"+friendEmail,
			email: friendEmail,
			signupDate: new Date(dateString)
		};
		const tempUser = await inviteRepository.createTempFriend(userId, tempFriend);
		if(tempUser.email === friendEmail){
			let emailSent;
			try{
				emailSent = await sendEmailToEmailServer(inviteFromUser, friendEmail, token);
			} catch (e) {
				console.log("[CAUGHT] Error sending email: " + e.message);
			}
			if(emailSent === true){
				return true;
			} else {
				const deleted = await userService.deleteUser(tempUser.userId);
				console.log("[DELETED TEMP USER]: " + JSON.stringify(deleted));
				return false;
			}
		} else {
			throw new Error('Could not create temporary friend with email: ' + friendEmail);
		}
	},
	async acceptInvitation(userId: string, token: string, name: string, username: string, email: string) {
		const tokenObject = getTokenObject(token);
		if(!token){
			return "INVALID TOKEN";
		}
		if(email !== tokenObject.friendEmail){
			return "INVALID EMAIL";
		}

		try {
			const user: User = {
				userId: userId,
				name: name,
				username: username,
				email: tokenObject.friendEmail,
				signupDate: new Date(new Date().toUTCString())
			}
			const oldStatus = getFriendStatus("INVITED");
			const newStatus = getFriendStatus("ACCEPTED");
			const updatedFriend = await inviteRepository.updateTempFriend(tokenObject.inviteUserId, user, tokenObject.friendId, oldStatus, newStatus);
			if(!updatedFriend || (updatedFriend.userId !== userId)){
				throw new Error("Couldn't save user into database! Repo returned: " + JSON.stringify(updatedFriend));
			}
			return updatedFriend;
		} catch (e) {
			console.log("Error in invitationService.acceptInvitation: + " + e.message);
			throw new Error(e.message);
		}

	}
}