import Email from "../models/Email";
import User from "../models/User";
import { isEmail } from "../validation/input-validation";

const signupUrl = process.env.USER_SERVICE_SIGNUP_URL;

export const invitationEmail = (inviteFromUser: User, friendEmail: string, token: string): Email => {
	if(!isEmail(friendEmail)){
		throw new Error('Invalid email address in invitation email');
	}
	
	const url = signupUrl+"?email="+friendEmail+"&token="+token;
	const subject = `Invite from ${inviteFromUser.name} to join our wishlist platform`;
	const html = 
	`
		<h1>Hey!</h1>
		<h2>${inviteFromUser.name} just sent you an invitation to join our wishlist platform!</h2>
		<p>
			We'd love to have you join our wishlist platform, just click the link below
			and you'll be redirected to our signup page!
			Once you join, you'll automatically be friends with ${inviteFromUser.name}!
		</p>
		<strong>Link:</strong>
		<a href="${url}">Signup Link</a>
		
		<h3>See you there!</h3>
	`

	const email: Email = {
		sender: {
			email: process.env.EMAIL_SERVER_SENDER_EMAIL,
			password: process.env.EMAIL_SERVER_SENDER_PASSWORD
		},
		email: {
			to: friendEmail,
			subject: subject,
			html: html,
			text: ""
		}
	}

	return email;
}