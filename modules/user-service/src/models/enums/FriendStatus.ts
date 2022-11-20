export enum FriendStatus {
	INVITED = "INVITED", 			// Sent email to non user - Consider getting the same info from friend node instead
	REQUESTED = "REQUESTED", 	// Sent friend request to an existing user
	ACCEPTED = "ACCEPTED" 		// Friends both
}



export const getFriendStatus = (friendStatus: string) => {
	switch(friendStatus.toUpperCase()){
		case 'INVITED':
      return FriendStatus.INVITED;
		case 'REQUESTED':
			return FriendStatus.REQUESTED;
		case 'ACCEPTED':
			return FriendStatus.ACCEPTED;
	}
	return null;
}