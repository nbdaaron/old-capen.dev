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

app.use('/graphql', graphqlHTTP({
	schema: buildSchema(schemaFile),
	rootValue: new Root(),
	graphiql: true
}));

const credentials = {
	key: config.privateKey,
	cert: config.certificate,
	ca: config.ca
};

// Routes

app.get('/', (req, res) => {
	res.render('home', {
		a: "Capen"
	});
});

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

var io = sio.listen(httpsServer, credentials);

// Socket Connections

io.on('connection', (socket) => {
	generateUser(socket);
});

function generateUser(socket) {
	socket.emit('NewUsername', 'BOB');
}