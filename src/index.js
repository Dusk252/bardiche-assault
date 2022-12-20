require('dotenv').config();
const keepAlive = require('./server');
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');
const { TwitterApi } = require('twitter-api-v2');

// create client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const userClient = new TwitterApi({ appKey: process.env.TWITTER_KEY, appSecret: process.env.TWITTER_SECRET });
client.mongoClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, loggerLevel: 'error' });
client.twitterClient = { userClient, appClient: null };
client.commands = new Collection();
client.buttons = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync('./src/functions');
for (const folder of functionFolders) {
	const functionFiles = fs.readdirSync(`./src/functions/${folder}`)
        .filter((file) => file.endsWith('.js'));
    for (const file of functionFiles)
        require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents(client);
client.handleCommands(client);
client.handleComponents(client);

client.login(process.env.TOKEN);
keepAlive(client);

process.on('exit', async () => {
    if (client.twitterClient.stream)
        client.twitterClient.stream.destroy();
});