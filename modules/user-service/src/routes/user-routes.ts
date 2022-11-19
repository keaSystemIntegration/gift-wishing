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
