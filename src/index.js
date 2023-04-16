require('dotenv').config();
const keepAlive = require('./server');
const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');

// create client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.mongoClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, loggerLevel: 'error' });

const commandList = new Set(['base.js', 'jisho.js', 'reminder.js', 'rng.js', 'setTimezone.js']);
client.commands = new Collection();
client.buttons = new Collection();
client.commandArray = [];

//const clientInitializationFolder = 'functions/clients';
const handlersFolder = 'functions/handlers';
const toolsFolder = 'functions/tools';

const initialize = (path, list) => {
    const functionFiles = fs.readdirSync(`./src/${path}`)
            .filter((file) => list.has(file));
    for (const file of functionFiles)
        require(`./${path}/${file}`)(client);
};

initialize(handlersFolder, new Set(['handleCommands.js', 'handleComponents.js', 'handleEvents.js']));
initialize(toolsFolder, new Set(['initializeScehduler.js']));

client.handleEvents();
client.handleCommands(commandList);
client.handleComponents();

client.login(process.env.TOKEN);
keepAlive(client);

process.on('exit', async () => {
    // if (client.twitterClient?.stream)
    //     client.twitterClient.stream.destroy();
});