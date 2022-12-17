import { userService } from "../services/user-service";
import { Router } from "express";
export const userRoutes = Router();

/**
 * Get User
 * Body:
 * - userId
 */
userRoutes.get('/', async (req, res) => {
	try{
		const { userId } = req.body;
		const dbResponse = await userService.getUserById(userId);
		res.json(dbResponse);
	}catch(e){
		console.log(`Error in userRoutes.get('/'): \n` + e.message);
		res.status(500).send({error: e.message});
	}
});

userRoutes.get('/w-friends', async (req, res) => {
	try {
		const { userId } = req.body;
		const dbResponse = await userService.getUserAndFriendsById(userId);
		res.json(dbResponse);
	} catch (e) {
		console.log(`Error in userRoutes.get('/'): \n` + e.message);
		res.status(500).send({error: e.message});
	}
});

userRoutes.get('/friend-suggestions', async (req, res) => {
	try{
		const { userId } = req.body;
		// Currently we're just returning all users with a limit of 150.
		// But for future iterations, we expect this to change to be more user focused (e.g. friend suggestions)
		// So for now we we'll include the userId in the query (as it is there by default due to the userGuard).
		const dbResponse = await userService.getUsers(userId);
		res.json(dbResponse);
	} catch (e) {
		console.log(`Error in userRoutes.get('/'): \n` + e.message);
		res.status(500).send({error: e.message});
	}
});

/**
 * Create User
 * Body
 * - name
 * - username
 * - email
 */
userRoutes.post('/', async (req, res) => {
	try{
		const { userId, name, username, email } = req.body;
		if(!userId || !name || !username || !email){
			console.log("Missing something here in userRoutes.post: \n userId: " + userId + ", name: " + name + ", username: " + ", email: " + email);
			throw new Error("Missing something here in userRoutes.post:  userId: " + userId + ", name: " + name + ", username: " + ", email: " + email);
		}
		console.log("We've gotten to the router at least: " + name + ", " + username + " and " + email)
		const dbResponse = await userService.createUser(userId, name, username, email);
		res.json(dbResponse);
	} catch(e: any) {
		console.log("Error in userRoutes.post('/'): \n" + e.message);
		res.status(500).send({error: e.message});
	}
});

/**
 * Update user
 * Body
 * - userId
 * - name
 * - username
 */
userRoutes.put('/', async (req, res) => {
	try{
		const { userId, name, username } = req.body;
		const dbResponse = await userService.updateUser(userId, name, username);
		res.json(dbResponse);
	}catch(e){
		console.log(`Error in userRoutes.put('/'): \n` + e.message);
		res.status(500).send({error: e.message});
	}
});

/**
 * Delete user
 * Body
 * - userId
 */
userRoutes.delete('/', async (req, res) => {
	try{
		const { userId } = req.body;
		const dbResponse = await userService.deleteUser(userId);
		res.json(dbResponse);
	}catch(e){
		console.log(`Error in userRoutes.delete('/'): \n` + e.message);
		res.status(500).send({error: e.message});
	}
})
