const { SlashCommandBuilder } = require('discord.js');
const { listTimeZones } = require('timezone-support');

const choices = listTimeZones();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-timezone')
		.setDescription('Saves the preferred timezone for the user. This is necessary to use the AK base commands.')
		.addStringOption((option) => option.setName('timezone').setDescription('Timezone. Type for autocomplete.').setAutocomplete(true).setRequired(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused().toLowerCase();
		const filtered = choices.filter((choice) => choice.toLowerCase().includes(focusedOption));
		await interaction.respond(filtered.slice(0, 25).map((choice) => ({ name: choice, value: choice })));
	},
	async execute(interaction, client) {
		const option = interaction.options.getString('timezone');
		if (!choices.includes(option))
			await interaction.reply({ content: 'Please choose a valid timezone option.', ephemeral: true });
		else {
			const query = { userId: interaction.user.id };
			const update = { $set: { userId: interaction.user.id, timezone: option } };
			await client.mongoClient
				.db()
				.collection('user_locale')
				.updateOne(query, update, { upsert: true });
			await interaction.reply({ content: `User timezone set to ${option}.`, ephemeral: true });
		}
	},
};