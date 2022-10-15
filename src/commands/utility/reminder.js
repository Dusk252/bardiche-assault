const { SlashCommandBuilder } = require('discord.js');
const { findTimeZone, getUnixTime } = require('timezone-support');

const reminderIn = {
	data: subcommand => subcommand
		.setName('on')
		.setDescription('Remind user on a specific date.')
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
		.setRequired(true))
		.addStringOption(option => option.setName('content').setDescription('Text content of the reminder.').setRequired(true)),
	execute: async (interaction, client) => {
			const days = interaction.options.getInteger('days') || 0;
			const hours = interaction. options.getInteger('hours') || 0;
			const minutes = interaction.options.getInteger('minutes') || 0;
			const content = interaction.options.getString('content');
			if (!(minutes || hours || days)) {
				await interaction.reply({ content: '``Please provide in how long you want to be reminded of this.``', ephemeral: true });
				return;
			}
			else {
				const date = new Date();
				const timeToAdd = ((days * 24 + hours) * 60 + minutes) * 60000;
				date.setTime(date.getTime() + timeToAdd);
				await client.mongoClient
					.db()
					.collection('reminders')
					.insertOne({
						channelId: interaction.channelId,
						userId: interaction.user.id,
						dateTime: date,
						content: content,
					});
				await interaction.reply(`\`\`Reminder set for \`\`<t:${Math.floor(date.getTime() / 1000)}>\`\`.\`\``);
			}
	},
};

const reminderOn = {
	data: subcommand => subcommand
		.setName('in')
		.setDescription('Remind user in x amount of time.')
		.addStringOption(option => option.setName('content').setDescription('Text content of the reminder.').setRequired(true))
		.addIntegerOption(option => option.setName('days').setDescription('Days'))
		.addIntegerOption(option => option.setName('hours').setDescription('Hours'))
		.addIntegerOption(option => option.setName('minutes').setDescription('Minutes')),
	execute: async (interaction, client) => {
		const year = interaction.options.getInteger('year');
		const month = interaction.options.getInteger('month');
		const day = interaction.options.getInteger('day');
		const h = interaction.options.getInteger('h');
		const m = interaction.options.getInteger('m');
		const content = interaction.options.getString('content');
		const userTimezone = await client.mongoClient
			.db()
			.collection('user_locale')
			.findOne({ serverId: interaction.guildId, userId: interaction.user.id });
		if (!userTimezone) {
			await interaction.reply({ content: `\`\`Please set a timezone to use as reference for your reminders using the /set-timezone command.\`\`
				\n``You only need to do this once for this server.\`\``, ephemeral: true });
			return;
		}
		const timezone = findTimeZone(userTimezone.timezone);
		const time = { year, month, day, hours: h, minutes: m };
		const date = new Date(getUnixTime(time, timezone));
		if (date < Date.now()) {
			await interaction.reply({ content: '``Unfortunately I can\'t timetravel yet.``', ephemeral: true });
			return;
		}
		await client.mongoClient
			.db()
			.collection('reminders')
			.insertOne({
				channelId: interaction.channelId,
				userId: interaction.user.id,
				dateTime: date,
				content: content,
			});
		await interaction.reply(`\`\`Reminder set for \`\`<t:${Math.floor(date.getTime() / 1000)}>\`\`.\`\``);
	},
};


module.exports = {
	data: new SlashCommandBuilder()
		.setName('reminder')
		.setDescription('Sets a reminder for the user.')
		.addSubcommand(reminderIn.data)
		.addSubcommand(reminderOn.data),
	async execute(interaction, client) {
		switch (interaction.options.getSubcommand()) {
			case 'in':
				await reminderIn.execute(interaction, client);
				break;
			case 'on':
				await reminderOn.execute(interaction, client);
				break;
			default:
				await interaction.reply({ content: '``This subcommand does not exist.``', ephemeral: true });
		}
	},
};