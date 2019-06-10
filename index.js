const server = require('./src/server');

// Init and log config
const config = require('dotenv').config().parsed;

console.log('Twitchcast Server configuration:');
Object.keys(config).forEach(key => {
    console.log(`\t${key}: ${config[key]}`);
});

const port = process.env.TWITCHCAST_SERVER_PORT || 3000;

server.start(port);

console.log(`Twitchcast server running on port: ${port}`);
