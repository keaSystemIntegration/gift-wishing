import { userService } from "../services/user-service";


export const profilePictureGuard = (req, res, next) => {
	try {
		const claim = JSON.parse(req.cookies.Claims);
		const claimUserId = claim.userId;

		if(!claim || !claimUserId){
			throw new Error('Profile Picture Guard: No user credentials found in token');
		}

		userService.getUserById(claimUserId)
			.then((user) => {
				if(user.username !== req.body.username && !req.params.username) {
					// Trying to change someone elses profile picture!!!
					// Should introduce a penalty system for them.
					console.log("We're changing the req.body.username");
					console.log("Before: " + req.body.username);
					console.log("After:  " + user.username);
				}
				const { username } = req.params;

				if(username) {
					console.log("Changing params from " + username + " to " + user.username);
					req.params.username = user.username;
				} else {
					req.body.username = user.username;
				}

				next();
			})
			.catch((err) => {
				throw new Error('Profile Picture guard: userId not found in the database, db error: ' + err.message);
			});
		
	} catch (err) {
		console.log("[CAUGHT] in profile picture guard: " + err.message);
		res.status(401).send({message: err.message});
	}
}