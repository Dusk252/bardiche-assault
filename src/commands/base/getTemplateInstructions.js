const { SlashCommandBuilder } = require('discord.js');
const createInstructionsEmbed = require('../../helpers/base/createInstructionsEmbed');

const instructionsEmbed = createInstructionsEmbed();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-template-instructions')
		.setDescription('Get instructions on how to fill in info when submitting your base layout.'),
	async execute(interaction) {
        await interaction.reply({
            embeds: [instructionsEmbed],
            ephemeral: true,
        });
	},
};