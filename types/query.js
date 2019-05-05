const { getUser } = require('../utils');

module.exports = {
	/**
	 * Retrieves all users in the database.
	 */
	users: (root, args, context, info) => context.prisma.users(),
	/**
	 * Retrieves the user currently logged in.
	 * If user is not logged in, returns null.
	 */
	user: (root, args, context, info) => {
		try {
			let userId = getUser(context).id;
			if (userId.startsWith('*Guest')) {
				return {
					id: userId,
					username: userId.slice(1),
					email: '',
					friends: []
				};
			}
			return context.prisma.user({ id: userId });
		} catch {
			return null;
		}
	},
	/**
	 * Retrieves the last 5 chat messages.
	 */
	getChatMessages: (root, args, context, info) => {
		// let user = getUser(context);
		return context.prisma.chatMessages({
			orderBy: 'created_at_ASC',
			last: 5
		});
	}
}