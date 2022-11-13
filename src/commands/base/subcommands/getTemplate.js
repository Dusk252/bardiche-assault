const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const button1 = new ButtonBuilder()
    .setCustomId('base_get-blank-template')
    .setLabel('Blank')
    .setStyle(ButtonStyle.Primary);

const button2 = new ButtonBuilder()
    .setCustomId('base_get-current-setup')
    .setLabel('Current Setup')
    .setStyle(ButtonStyle.Primary);

module.exports = {
	data: subcommand => subcommand
		.setName('get-template')
		.setDescription('Get a .json template to submit your base schedule to the bot.'),
	async execute(interaction, client) {
        const currentSetup = await client.mongoClient
            .db()
            .collection('base_schedule')
            .findOne({ userId: interaction.user.id });

        button2.setDisabled(currentSetup == null);

        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(button1, button2)],
            ephemeral: true,
        });
	},
};