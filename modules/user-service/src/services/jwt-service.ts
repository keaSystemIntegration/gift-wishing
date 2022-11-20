import jwt from 'jsonwebtoken';
import "dotenv/config";
import InviteToken from '../models/InviteToken';

const secret = process.env.JWT_SECRET;

export const createToken = (object: InviteToken) => {
	const token = jwt.sign(object, secret);
	return token;
}

export const getTokenObject = (token: any):InviteToken | null  => {
	const tokenObject = jwt.verify(token, secret);
	return tokenObject as InviteToken;
}
