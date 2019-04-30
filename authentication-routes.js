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
		done(null, user.name);
	});

	// User Deserialization
	passport.deserializeUser((id, done) => {
		done(null, {
			name: id
		});
	});

	app.get('/guest', passport.authenticate('dummy', {
		successRedirect: '/',
		failureRedirect: '/'
	}));

	app.post('/register', (req, res) => {
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