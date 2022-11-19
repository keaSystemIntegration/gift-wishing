import { Router } from "express";
import { relationshipService } from "../services/relationship-service";


export const relationshipRoutes = Router();

// TODO: Add check for user being authenticated

// CREATE RELATIONSHIP
relationshipRoutes.post('/', async (req, res) => {
	try {
		const { userId, friendId } = req.body;
		const result = await relationshipService.createRelationship(userId, friendId);
		res.json(result);
	} catch (e) {
		console.log("Error in relationshipRoutes.post('/'): \n"+ e.message);
		res.status(500).send({error: e.message});
	}
});

// UPDATE RELATIONSHIP
relationshipRoutes.put('/', async (req, res) => {
	try {
		const { userId, friendId, status } = req.body;
		const result = await relationshipService.updateRelationship(userId, friendId, status);
		res.json(result);
	} catch (e) {
		console.log("Error in relationshipRoutes.put('/'): \n"+ e.message);
		res.status(500).send({error: e.message});
	}
});

// DELETE RELATIONSHIP
relationshipRoutes.delete('/', async (req, res) => {
	try {
		const { userId, friendId } = req.body;
		const result = await relationshipService.deleteRelationship(userId, friendId);
		res.json({deleted: result});
	} catch (e) {
		console.log("Error in relationshipRoutes.delete('/'): \n"+ e.message);
		res.status(500).send({error: e.message});
	}
});
