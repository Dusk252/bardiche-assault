const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    execute: async (interaction, client) => {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
        else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);
            if (!button) return;
            try {
                await button.execute(interaction, client);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error executing this button handler!', ephemeral: true });
            }
        }
        else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.autocomplete(interaction, client);
            }
            catch (error) {
                console.error(error);
            }
        }
    },
};