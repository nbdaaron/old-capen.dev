// Authentication (Passport.js) Dependencies
const passport = require('passport');
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

// Encryption library for password hashing
const bcrypt = require('bcrypt');

/**
* Called to setup authentication routes.
*/
module.exports = (app) => {

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

	app.get('/guest', passport.authenticate('dummy', {
		successRedirect: '/',
		failureRedirect: '/'
	}));

	app.post('/register', async (req, res) => {
		// We already have a check that password = confirm password on frontend.
		// We'll have one more backend-side check in case we have some sneaky users.
		if (req.body.password != req.body.confirm) {
			req.session.error = { message: 'Passwords do not match!' };
			res.redirect('/register');
			return;
		}
		let passHash = await bcrypt.hash(req.body.password, config.saltRounds);
		try {
			let user = await prisma.createUser({
				username: req.body.username,
				password: passHash,
				email: req.body.email
			});
		} catch {
			req.session.error = { message: 'A user with this username already exists!' };
			res.redirect('/register');
			return;
		}

		res.redirect('/');
		
	});

	// Authentication Route
	// TODO: PassportJS Custom Authentication Callback for
	// Injecting messages with failure redirect
	app.post('/login', (req, res, next) => {
		passport.authenticate('local', (err, user, info) => {
			if (err) {
				return next(err);
			}
			if (!user) {
				req.session.error = info;
				return res.redirect('/');
			}
			req.login(user, (loginErr) => {
		      if (loginErr) {
		        return next(loginErr);
		      }
		      return res.redirect('/');
		    });
		})(req, res, next);
	});

	app.get('/logout', (req, res) => {
	  req.logout();
	  res.redirect('/');
	});
}