const { findTimeZone, getUnixTime } = require('timezone-support');
const { time } = require('discord.js');

module.exports = {
	data: subcommand => subcommand
		.setName('set-next-rotation')
		.setDescription('Manually set the time for your next rotation.')
		.addIntegerOption(option => option.setName('year').setDescription('Year')
		.setMinValue(new Date().getFullYear())
		.setMaxValue(9999)
		.setRequired(true))
		.addIntegerOption(option => option.setName('month').setDescription('Month')
		.setMinValue(1).setMaxValue(12)
		.setRequired(true))
		.addIntegerOption(option => option.setName('day').setDescription('Day')
		.setMinValue(1).setMaxValue(31)
		.setRequired(true))
		.addIntegerOption(option => option.setName('h').setDescription('Hour (0 to 24)')
		.setMinValue(0).setMaxValue(24)
		.setRequired(true))
		.addIntegerOption(option => option.setName('m').setDescription('Minutes')
		.setMinValue(0).setMaxValue(59)
		.setRequired(true)),
	execute: async (interaction, client) => {
        const year = interaction.options.getInteger('year');
		const month = interaction.options.getInteger('month');
		const day = interaction.options.getInteger('day');
		const h = interaction.options.getInteger('h');
		const m = interaction.options.getInteger('m');
        const schedule = await client.mongoClient
            .db()
            .collection('base_schedule')
            .findOne({ userId: interaction.user.id });
        if (!schedule)
            await interaction.reply({ content: 'No base schedule set for this user yet. Use /set-schedule to set your base schedule.', ephemeral: true });
        else if (!schedule.isTracking)
            await interaction.reply({ content: 'Your rotation tracking is not active. Use /start-tracking to start.', ephemeral: true });
        else {
            const userTimezone = await client.mongoClient
                .db()
                .collection('user_locale')
                .findOne({ userId: interaction.user.id });
            if (!userTimezone) {
                await interaction.reply({ content: `Please set a timezone to use as reference using the /set-timezone command.
                    \n``You only need to do this once.`, ephemeral: true });
                return;
            }
            const timezone = findTimeZone(userTimezone.timezone);
            const localTime = { year, month, day, hours: h, minutes: m };
            const date = new Date(getUnixTime(localTime, timezone));
            if (date < Date.now()) {
                await interaction.reply({ content: 'Unfortunately I can\'t timetravel yet.', ephemeral: true });
                return;
            }
            await client.mongoClient
                .db()
                .collection('base_schedule')
                .updateOne(
                    { userId: interaction.user.id },
                    { $set: {
                            'nextRotation': date,
                        },
                    });
            await interaction.reply({ content: `The time for your next rotation was successfully changed to ${time(date)}.`, ephemeral: true });
        }
	},
};