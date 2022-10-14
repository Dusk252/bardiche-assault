const express = require('express');
const server = express();
const port = process.env.PORT || 3001;

server.all('/', (_, res) => {
    res.send('Result: [OK]');
});

function keepAlive(client) {
    server.listen(port, async () => {
        await client.mongoClient.connect();
        const date = new Date();
        console.log(`Server is ready! | ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
    });
}

module.exports = keepAlive;