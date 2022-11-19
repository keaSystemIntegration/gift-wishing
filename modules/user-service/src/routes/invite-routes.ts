import { Router } from "express";
import { inviteService } from "../services/invite-service";
import { isEmail } from "../validation/input-validation";

export const inviteRoutes = Router();

// TODO: Add check for user being authenticated

// Send invitation to user with friendEmail
inviteRoutes.post('/send', async (req, res) => {
	try {
		const { userId, friendEmail } = req.body;
		if(!isEmail(friendEmail)){
			throw new Error('Invalid friendEmail');
		}
		const inviteSuccess = await inviteService.sendInvitation(userId, friendEmail);
		if(inviteSuccess === true){
			res.status(200).json({inviteStatus: 'Success!'});
		} else {
			console.log("Error in sending invitation - Check the email server!");
			res.status(503).json({inviteStatus: 'Error! Please try again later!'});
		}
	} catch (e) {
		console.log("Error in inviteRoutes.post('/send'): \n"+ e.message);
		res.status(500).send({error: e.message});
	}
});

// Accept invitation
inviteRoutes.post('/accept', async (req, res) => {
	try {
		const { token, userId, name, username, email } = req.body;
		const acceptedResponse = await inviteService.acceptInvitation(userId, token, name, username, email);
		if(acceptedResponse === "INVALID TOKEN"){
			res.status(403).send({error: "Invalid token - token might be too old, although that'd be weird, no expiration on tokens here!"});
		} else if (acceptedResponse === "INVALID EMAIL") {
			res.status(403).send({error: "Invalid email, does not match invite token!"});
		} else {
			res.json(acceptedResponse);
		}
	} catch (e) {
		console.log("Error in inviteRoutes.post('/accept'): \n"+ e.message);
		res.status(500).send({error: e.message});
	}

});
