import axios from "axios";
import User from "../models/User";
import { invitationEmail } from "../templates/email-invitation-templates";

const productionEnv = process.env.NODE_ENV === "production";
const emailServer = productionEnv ? process.env.EMAIL_SERVER_URL_PROD : process.env.EMAIL_SERVER_URL_LOCAL;
const emailServerQueryParams = productionEnv ? "?code="+process.env.EMAIL_SERVER_ACCESS : "";
export const emailServerUrl = emailServer + emailServerQueryParams;

export const sendEmailToEmailServer = async (inviteFromUser: User, friendEmail: string, token: string) => {
	try {
		const email = invitationEmail(inviteFromUser, friendEmail, token);

		let config = {
			method: 'post',
			url: emailServerUrl,
			headers: { 
				'Content-Type': 'application/json'
			},
			data : JSON.stringify(email)
		};

		let resp = await axios(config);
		if(resp.data){
			console.log(`
				Sent email email-server with url: ${emailServerUrl}
				\nSending to ${friendEmail} and received response:
				\n${JSON.stringify(resp.data)}\n`);
			
			if(resp.data.sentEmails.length > 0){
				return true;
			}
		}
		return false;
	} catch (err) {
		console.log("[CAUGHT] Error in sending email to email server 'email-server-service.ts':\n" + err.message);
		throw new Error(err.message);
	}
}
