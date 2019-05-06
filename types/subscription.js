const config = require('../config');
const { getUserFromConnection } = require('../utils');

module.exports = {
	/**
	 * Subscribes to new chat messages created on the homepage.
	 * A subscription update will be sent everytime a new message is created
	 */
	chatMessage: {
		subscribe: (root, args, context, info) => {
			let user = getUserFromConnection(context.connection);
	        return context.pubsub.asyncIterator(config.channels.homeChatChannel);
		}
	}
};