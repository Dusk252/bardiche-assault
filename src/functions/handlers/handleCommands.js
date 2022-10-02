const fs = require('fs');
const { REST, Routes } = require('discord.js');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./src/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`)
                .filter((file) => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                if (command.data) {
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                }
            }
        }
        console.log('Registering application commands.');
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: client.commandArray })
            .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
            .catch(console.error);
    };
};