const jwt = require('jsonwebtoken');
const config = require('./config');

function getUser(context) {
  	const Authorization = context.request.get('Authorization');
  	if (Authorization) {
    	const user = jwt.verify(Authorization, config.JWT_SECRET);
    	return user;
  	}

  throw new Error('Not authenticated');
}

function getUserFromConnection(connection) {
	const Authorization = connection.context.authorization;
  	if (Authorization) {
    	const user = jwt.verify(Authorization, config.JWT_SECRET);
    	return user;
  	}
  	throw new Error('Not authenticated');
}

module.exports = {
	getUser,
	getUserFromConnection
};