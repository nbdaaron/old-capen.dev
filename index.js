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
	context: { prisma }
});

const app = server.express;

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

setupAuthRoutes(app);
setupPageRoutes(app);

server.start({
	playground: '/graphql',
	https: config.httpsCredentials,
	port: 443
}, () => {
	console.log('Listening on port 443.');
});