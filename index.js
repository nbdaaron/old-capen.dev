// Express Dependencies
var express = require('express');
var https = require('https');
var http = require('http');

// Authentication Dependencies
const passport = require('passport');

// GraphQL Dependencies
const { GraphQLServer, PubSub } = require('graphql-yoga');

// Prisma
const { prisma } = require('./generated/prisma-client');

// GraphQL Types
const resolvers = require('./types/resolvers');

// Filesystem Dependencies
const fs = require('fs');
const path = require('path');

// Imported Files
const schemaFile = fs.readFileSync(path.resolve(__dirname, 'schema.graphql'), 'utf8');
const config = require('./config');

// Redirect all HTTP Calls to HTTPS
var app = express();

http.createServer(app).listen(80);
https.createServer(config.httpsCredentials, app).listen(443);

app.use(express.static('client/build'));

const pubsub = new PubSub();

const server = new GraphQLServer({
	typeDefs: schemaFile, 
	resolvers: resolvers,
	context: (contextParameters) => {
		return { ...contextParameters, prisma, pubsub };
	}
});

server.start({
	playground: '/graphql',
	https: config.httpsCredentials,
	port: config.graphqlPort
}, () => {
	console.log(`Listening on port ${config.graphqlPort}.`);
});