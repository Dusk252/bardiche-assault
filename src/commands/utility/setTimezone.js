const { SlashCommandBuilder } = require('discord.js');
const { listTimeZones } = require('timezone-support');

const choices = listTimeZones();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-timezone')
		.setDescription('Saves the preferred timezone for a user in the server.')
		.addStringOption((option) => option.setName('timezone').setDescription('Timezone. Type for autocomplete.').setAutocomplete(true).setRequired(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused().toLowerCase();
		const filtered = choices.filter((choice) => choice.toLowerCase().includes(focusedOption));
		await interaction.respond(filtered.slice(0, 25).map((choice) => ({ name: choice, value: choice })));
	},
	async execute(interaction, client) {
		const option = interaction.options.getString('timezone');
		if (!choices.includes(option))
			await interaction.reply('``Please choose a valid timezone option.``');
		else {
			const query = { serverId: interaction.guildId, userId: interaction.user.id };
			const update = { $set: { serverId: interaction.guildId, userId: interaction.user.id, timezone: option } };
			await client.mongoClient
				.db()
				.collection('user_locale')
				.updateOne(query, update, { upsert: true });
			await interaction.reply(`\`\`User timezone set to ${option}\`\``);
		}
	},
};