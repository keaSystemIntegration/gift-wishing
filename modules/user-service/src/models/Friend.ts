import { FriendStatus } from "./enums/FriendStatus";

export default interface Friend {
	friendId: string,
	friendName: string,
	friendEmail: string,
	friendStatus: FriendStatus,
	requestedBy?: string
}
