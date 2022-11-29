import { userService } from "../services/user-service";

const noAuthPostPaths = [
	"/invite/accept",
	"/user"
]


/**
 * Method overrides the userId in the req.body.
 * In case someone tries to CRUD another user.
 * - If you try to delete another user - You'll be deleted !
 */
export const userGuard = (req, res, next) => {
	try {

		const claim = JSON.parse(req.cookies.Claims);
		const claimUserId = claim.userId;

		if(!claim || !claimUserId){
			throw new Error('User Guard: No user credentials found in token');
		}

		const path = req.path;
		const method = req.method.trim();
		const POST = "POST";

		if(method === POST && noAuthPostPaths.includes(path)) {
			req.body.userId = claimUserId;
			next();
			return;
		}

		userService.getUserById(claimUserId)
			.then((user) => {
				if(user.userId !== req.body.userId) {
					console.log("We're changing the req.body.userId");
					console.log("Before: " + req.body.userId);
					console.log("After:  " + user.userId);
				}
				req.body.userId = user.userId;
				next();
			})
			.catch((err) => {
				throw new Error('User Guard: userId not found in the database, db error: ' + err.message);
			});
		
	} catch (err) {
		console.log("[CAUGHT] in user guard: " + err.message);
		res.status(401).send({message: err.message});
	}
}