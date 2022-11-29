import { Router } from "express";
import { profilePictureGuard } from "../middleware/profile-picture-guard";
import { azureDelete, azureFetch, azureUpload, upload } from "../services/profile-picture-service";

export const profilePictureRoutes = Router();


profilePictureRoutes.get('/:username', profilePictureGuard, async (req, res) => {
	try {
		const { username } = req.params;
		if(!username)
			throw new Error("username undefined");
		const azResponse = await azureFetch(username);
		res.header("content-type", "image/png");
		res.send(azResponse);
	} catch (err) {
		console.log(`Error in profilePictureRoutes.get('/'): \n` + err.message);
		res.status(404).send({error: err.message});
	}
});

profilePictureRoutes.post('/', upload.single('file'), profilePictureGuard, async (req, res) => {
	try {
		const ONE_MEGABYTE = 1024 * 1024;
		const { buffer, size, mimetype } = req.file;
		const { username } = req.body;
		const valid = size < ONE_MEGABYTE && (
			mimetype === "image/png" ||
			mimetype === "image/jpg" ||
			mimetype === "image/jpeg"
		); 
		if(!buffer) {
			throw new Error("buffer undefined or null");
		}
		if(!username){
			throw new Error("username undefined or null");
		}
		if(!valid) {
			throw new Error("Must be jpg, png or jpeg, and maximum 1MB size allowed")
		}
		const result = await azureUpload(buffer, username);
		res.send({message: result});
	} catch (err) {
		console.log(`Error in profilePictureRoutes.post('/'): \n` + err.message);
		res.status(500).send({error: err.message});
	}
});


profilePictureRoutes.delete('/', profilePictureGuard, async (req, res) => {
	try {
		const { username } = req.body;
		if(!username)
			throw new Error("username undefined");
		const azResponse = await azureDelete(username);
		if(azResponse.succeeded === false) {
			const errorCode = azResponse.errorCode;
			const code = errorCode === "BlobNotFound" ? 404 : 400;
			res.status(code).send({message: "Error deleting: " + errorCode})
		} else {
			res.send({message: "success"});
		}
	} catch (err) {
		console.log(`Error in profilePictureRoutes.get('/'): \n` + err.message);
		res.status(500).send({error: err.message});
	}
});

