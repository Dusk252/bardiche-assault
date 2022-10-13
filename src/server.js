const express = require('express');
const server = express();

server.all('/', (_, res) => {
    res.send('Result: [OK]');
});

function keepAlive(client) {
    server.listen(3000, async () => {
        await client.mongoClient.connect();
        console.log('Server is ready! | ' + Date.now());
    });
}

module.exports = keepAlive;