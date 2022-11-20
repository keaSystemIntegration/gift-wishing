
export default interface Email {
	sender?: {
		email: string,
		password?: string
	},
	email: {
			to: string,
			subject: string,
			html: string,
			text: string
	},
	notification?: {
		email: string,
		onFailure: boolean,
		onSuccess: boolean
	}
}
