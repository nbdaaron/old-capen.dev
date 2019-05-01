const LocalStrategy = require('passport-local').Strategy;
const { prisma } = require('../generated/prisma-client');
const bcrypt = require('bcrypt');

module.exports = new LocalStrategy(async (username, password, done) => {
	let user = await prisma.user({ username });
	if (!user) {
		return done(null, false, {
			message: 'Incorrect Credentials'
		});
	}
	let correctPassword = await bcrypt.compare(password, user.password);
	if (correctPassword) {
		return done(null, user);
	}
	return done(null, false, {
		message: 'Incorrect Credentials'
	});
});