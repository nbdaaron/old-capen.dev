// Express Dependencies
const http = require('http');
const https = require('https');
const express = require('express');

// GraphQL Dependencies
const { GraphQLServer } = require('graphql-yoga');

// Prisma
const { prisma } = require('./generated/prisma-client');

// GraphQL Types
const resolvers = require('./types/resolvers');

// Handlebars
const handlebars = require('express-handlebars');

// Filesystem Dependencies
const fs = require('fs');
const path = require('path');

// Route Handlers
const setupAuthRoutes = require('./authentication-routes');
const setupPageRoutes = require('./page-routes');

// Imported Files
const schemaFile = fs.readFileSync(path.resolve(__dirname, 'schema.graphql'), 'utf8');
const config = require('./config');

// Redirect all HTTP Calls to HTTPS
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

const server = new GraphQLServer({
	typeDefs: schemaFile, 
	resolvers: resolvers,
	context: (contextParameters) => {
		let user = contextParameters.request.user;
		return { prisma, user } 
	}
});

const app = server.express;

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Expose all public folder contents
server.use(express.static('public'));

setupAuthRoutes(server);
setupPageRoutes(server);

server.start({
	playground: '/graphql',
	https: config.httpsCredentials,
	port: 443
}, () => {
	console.log('Listening on port 443.');
});