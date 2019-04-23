// Dependencies
const http = require('http');
const https = require('https');
const express = require('express');

// GraphQL Dependencies
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

// GraphQL Types
const Root = require('./types/root');

// Handlebars
const handlebars = require('express-handlebars');

// Socket.IO
const sio = require('socket.io');

// Filesystem Dependencies
const fs = require('fs');
const path = require('path');

// Authentication (Passport.js) Dependencies
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
// Strategy for Username/Password Authentication
const localStrategy = require('./login_strategies/local');
// Strategy for Guest User Authentication
const dummyStrategy = require('./login_strategies/dummy');

// Imported Files
const schemaFile = fs.readFileSync(path.resolve(__dirname, 'schema.graphql'), 'utf8');
const config = require('./config');

// TODO:
// ABSTRACT ALL HTTP/HTTPS ROUTES INTO SEPARATE FILE
// ABSTRACT ALL GRAPHQL SCHEMAS INTO SEPARATE FILE (SINGLE FILE INITIALLY. SEPARATE IF NEEDED)
// ABSTRACT ALL SOCKET.IO CALLS/CONNECTIONS INTO SEPARATE FILES (PER-CONTENT BASIS)

const app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(session(config.sessionSettings));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/graphql', graphqlHTTP({
	schema: buildSchema(schemaFile),
	rootValue: new Root(),
	graphiql: true
}));

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

// Routes
app.get('/', (req, res) => {
	res.render('home', {
		user: req.user,
		error: req.session.error
	});

	delete req.session.error;
});

app.get('/register', (req, res) => {
	res.render('register', {
		error: req.session.error
	});

	delete req.session.error;
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

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(config.httpsCredentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

var io = sio.listen(httpsServer, config.httpsCredentials);

// Socket Connections

io.on('connection', (socket) => {
	generateUser(socket);
});

function generateUser(socket) {
	socket.emit('NewUsername', 'BOB');
}