const { getScheduleEmbed } = require('../../../helpers/base/createRotationEmbed');

module.exports = {
	data: subcommand => subcommand
		.setName('check-schedule')
		.setDescription('View your base layout and schedule.'),
	async execute(interaction, client) {
        const schedule = await client.mongoClient
            .db()
            .collection('base_schedule')
            .findOne({ userId: interaction.user.id });
        if (!schedule) {
            await interaction.reply({ content: 'No base schedule set for this user yet. Use /set-schedule to set your base schedule.', ephemeral: true });
            return;
        }
        const scheduleEmbed = getScheduleEmbed(schedule, interaction.user);
        await interaction.reply({
            embeds: [scheduleEmbed],
            ephemeral: true,
        });
	},
};