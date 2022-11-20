import { Router } from "express";
import { friendService } from "../services/friend-service";
import { isEmail } from "../validation/input-validation";

export const friendRoutes = Router();

/**
 * Get all friends of userId
 * Body:
 * - userId
 * Returns: List of User Objects and their friend status
 */
friendRoutes.get('/all', async (req, res) => {
	console.log("getting friend routes");
	try {
		let dbResponse = null;
		if(req.body.userId){
			console.log("Calling get user friends with userId");
			dbResponse = await friendService.getAllUserFriendsById(req.body.userId);
		} else if (req.body.email && isEmail(req.body.email)){
			console.log("Calling get user friends with email");
			dbResponse = await friendService.getAllUserFriendsByEmail(req.body.email);
		}
		if(dbResponse === null){
			throw new Error("Invalid input");
		}
		res.json(dbResponse);
	} catch(e) {
		console.log(`Error in friendRoutes.get('/'): \n` + e.message);
		res.status(500).send({error: e.message});
	}
});

/**
 * Get all friends of userId matching status
 * Body:
 * - userId
 * - status
 * Returns: List of User Objects and their friend status
 */
friendRoutes.get('/by-status', async (req, res) => {
	console.log("getting friend routes");
	try {
		const { userId, status } = req.body;
		const dbResponse = await friendService.getUserFriendsByStatus(userId, status);
		res.json(dbResponse);
	} catch (e) {
		console.log(`Error in friendRoutes.get('/'): \n` + e.message);
		res.status(500).send({error: e.message});
	}
});

