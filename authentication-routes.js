// Authentication (Passport.js) Dependencies
const session = require('express-session');
const bodyParser = require('body-parser');
// Strategy for Username/Password Authentication
const localStrategy = require('./login_strategies/local');
// Strategy for Guest User Authentication
const dummyStrategy = require('./login_strategies/dummy');
// Configuration file
const config = require('./config');

// Database Access for Registration
const { prisma } = require('./generated/prisma-client');

/**
* Called to setup authentication routes.
*/
module.exports = (app, passport) => {

	app.use(session(config.sessionSettings));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(passport.initialize());
	app.use(passport.session());
	passport.use(localStrategy);
	passport.use(dummyStrategy);

	// User Serialization
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	// User Deserialization
	passport.deserializeUser(async (id, done) => {
		if (id.startsWith('*Guest')) {
			return done(null, {
				id,
				username: id.slice(1)
			});
		}
		let user = await prisma.user({ id });
		done(null, user);
	});

	app.get('/guest', passport.authenticate('dummy'), (req, res) => {
		res.json({
			success: true,
			user: req.user
		});
	});

	app.post('/login', passport.authenticate('local'), (req, res) => {
		res.json({
			success: true,
			user: req.user
		})
	});

	app.get('/logout', (req, res) => {
		req.logout();
		res.redirect('/');
	});

	app.get('/whoami', (req, res) => {
		res.json(req.user);
	});
}