const express = require('express');
const server = express();

server.all('/', (_, res) => {
    res.send('Result: [OK]');
});

function keepAlive() {
    server.listen(3000, async () => {
        console.log('Server is ready! | ' + Date.now());
    });
}

module.exports = keepAlive;