const express = require('express');
const server = express();

server.all('/', (_, res) => {
    res.send('Result: [OK]');
});

function keepAlive() {
    server.listen(3000, () => {
        const date = new Date();
        console.log(`Server is ready! | ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
    });
}

module.exports = keepAlive;