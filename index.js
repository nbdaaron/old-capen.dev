// Express Dependencies
const http = require('http');
const https = require('https');
const express = require('express');

// GraphQL Dependencies
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

// Prisma
const { prisma } = require('./generated/prisma-client');

// GraphQL Types
const Root = require('./types/root');

// Handlebars
const handlebars = require('express-handlebars');

// Socket.IO
const sio = require('socket.io');

// Filesystem Dependencies
const fs = require('fs');
const path = require('path');

// Route Handlers
const setupAuthRoutes = require('./authentication-routes');
const setupPageRoutes = require('./page-routes');

// Imported Files
const schemaFile = fs.readFileSync(path.resolve(__dirname, 'schema.graphql'), 'utf8');
const config = require('./config');

// TODO:
// ABSTRACT ALL SOCKET.IO CALLS/CONNECTIONS INTO SEPARATE FILES (PER-CONTENT BASIS)

const app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/graphql', graphqlHTTP({
	schema: buildSchema(schemaFile),
	rootValue: new Root(),
	context: { prisma },
	graphiql: true
}));

setupAuthRoutes(app);
setupPageRoutes(app);

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(config.httpsCredentials, app);

httpServer.listen(3000, () => {
	console.log('HTTP Server running on port 3000');
});

httpsServer.listen(3001, () => {
	console.log('HTTPS Server running on port 3001');
});

var io = sio.listen(httpsServer, config.httpsCredentials);

// Socket Connections

io.on('connection', (socket) => {
	generateUser(socket);
});

function generateUser(socket) {
	socket.emit('NewUsername', 'BOB');
}