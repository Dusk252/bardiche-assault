const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rng')
		.setDescription('Generates a number between two arguments provided')
        .addIntegerOption(option => option.setName('min').setDescription('Min').setRequired(true).setAutocomplete(true))
        .addIntegerOption(option => option.setName('max').setDescription('Max').setRequired(true).setAutocomplete(true)),
	async execute(interaction) {
        const min = interaction.options.getInteger('min');
        const max = interaction.options.getInteger('max');
        const res = Math.floor(Math.random() * (max - min + 1)) + min;
		await interaction.reply('``' + res + '``');
	},
};