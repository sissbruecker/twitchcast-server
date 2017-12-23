const server = require('./src/server');

const port = process.env.TWITCHCAST_SERVER_PORT || 3000;

server.start(port);

console.log(`Twitchcast server running on port: ${port}`);
