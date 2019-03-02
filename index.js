// Dependencies
const http = require('http');
const https = require('https');
const express = require('express');

const config = require('./config');

const app = express();

const credentials = {
	key: config.privateKey,
	cert: config.certificate,
	ca: config.ca
};

app.use((req, res) => {
	res.send('Hello world');
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