const express = require('express');
const server = express();

server.all('/', (_, res) => {
    res.send('Result: [OK]');
});

function keepAlive(client) {
    server.listen(3000, async () => {
        await client.mongoClient.connect();
        const date = new Date();
        console.log(`Server is ready! | ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
    });
}

module.exports = keepAlive;