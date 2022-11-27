import { BlobServiceClient } from '@azure/storage-blob';
import multer from "multer";

const connectionString = process.env.USER_SERVICE_AZURE_BLOB_STORAGE_CONNECTION
const blobService = BlobServiceClient.fromConnectionString(connectionString);
const container = process.env.USER_SERVICE_AZURE_BLOB_STORAGE_CONTAINER;


export const upload = multer();

export const azureFetch = async (username: string) => {
	const fileName = username + "__profile-picture.png";
	const containerClient = blobService.getContainerClient(container);
	const response = await containerClient.getBlockBlobClient(fileName).downloadToBuffer();
	
	return response;
}

const UPLOAD_SUCCESS = "success";
export const azureUpload = async (buffer: any, username: string) => {
	console.log("Type of buffer: " + typeof buffer);
	const fileName = username + "__profile-picture.png";
	const containerClient = blobService.getContainerClient(container);
	await containerClient.getBlockBlobClient(fileName).uploadData(buffer);

	return UPLOAD_SUCCESS;
}

export const azureDelete = async (username: string) => {
	const fileName = username + "__profile-picture.png";
	const containerClient = blobService.getContainerClient(container);
	const response = await containerClient.getBlockBlobClient(fileName).deleteIfExists();
	
	return response;
};

export const imageExists = async (username: string) => {
	try {
		return azureFetch(username);
	} catch (err) {
		return false;
	}
}

// TODO: Call this when updating username!
export const updateProfilePictureName = async (oldUsername: string, newUsername: string) => {

	try {
		const newImageExists = imageExists(newUsername);
		const image = azureFetch(oldUsername);

		if (await newImageExists) {
			throw new Error("image with new username already exists!");
		} 

		if(!image) return {succeeded: true}; // User doens't have image, no need to update

		const uploadSuccess = await azureUpload(await image, newUsername);
		if(!uploadSuccess){
			throw new Error("Couldn't upload profile picture with new username " + newUsername);
		}
		const deleteOldImage = await azureDelete(oldUsername);
		if(deleteOldImage.succeeded === false){
			console.log("[WARN]: Couldn't delete old username profile picture");
		}

		return {succeeded: deleteOldImage.succeeded === true && uploadSuccess === UPLOAD_SUCCESS}

	} catch (err) {
		console.log("[CAUGHT] - Error: " + err.message);
		return {succeeded: false}
	}
}