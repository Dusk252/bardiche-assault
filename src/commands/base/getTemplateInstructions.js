const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const button = new ButtonBuilder()
    .setCustomId('base_get-template-instructions')
    .setLabel('Blank')
    .setStyle(ButtonStyle.Primary);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-template-instructions')
		.setDescription('Get instructions on how to fill in info when submitting your base layout.'),
	async execute(interaction) {
        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(button)],
            ephemeral: true,
        });
	},
};