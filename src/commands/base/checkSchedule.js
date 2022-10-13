const { SlashCommandBuilder } = require('discord.js');
const { getScheduleEmbed } = require('../../helpers/base/createRotationEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check-schedule')
		.setDescription('View your base layout and schedule.'),
	async execute(interaction, client) {
        const schedule = await client.mongoClient
            .db()
            .collection('base_schedule')
            .findOne({ userId: interaction.user.id });
        const scheduleEmbed = getScheduleEmbed(schedule, interaction.user);
        await interaction.reply({
            embeds: [scheduleEmbed],
            ephemeral: true,
        });
	},
};