const config = require('../config');
const { getUserFromConnection } = require('../utils');

module.exports = {
	chatMessage: {
		subscribe: (root, args, context, info) => {
			let user = getUserFromConnection(context.connection);
	        return context.pubsub.asyncIterator(config.channels.homeChatChannel);
		}
	}
};