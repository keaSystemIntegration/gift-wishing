import Friend from "./Friend";

export default interface User {
	userId: string,
	name: string,
	username: string,
	email: string,
	signupDate: Date,
	friends?: Friend[]
}
