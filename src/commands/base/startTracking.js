const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, time } = require('discord.js');

const button1 = new ButtonBuilder()
    .setCustomId('base_tracking-reset')
    .setLabel('Reset')
    .setStyle(ButtonStyle.Danger);

const button2 = new ButtonBuilder()
    .setCustomId('base_tracking-reset-cancel')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Primary);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-tracking')
		.setDescription('Start tracking your base rotations. The bot will notify you by dm.'),
	async execute(interaction, client) {
        const schedule = await client.mongoClient
            .db()
            .collection('base_schedule')
            .findOne({ userId: interaction.user.id });
        if (schedule) {
            if (schedule.isTracking) {
                const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });
                await interaction.reply({ content: `Your rotation tracking is already active with the next rotation on ${time(schedule.nextRotation)}.\n Do you want to reset your rotation schedule (tracking remainds active)?`,
                    components: [new ActionRowBuilder().addComponents(button1, button2)], ephemeral: true });
                collector.on('collect', async i => {
                    if (i.user.id === interaction.user.id) {
                        if (i.customId == 'base_tracking-reset') {
                            const date = new Date();
                            date.setTime(date.getTime() + schedule.rotations[0] * 60 * 60000);
                            await client.mongoClient
                                .db()
                                .collection('base_schedule')
                                .updateOne(
                                    { userId: interaction.user.id },
                                    { $set: {
                                        'currentRotationIndex': 0,
                                        'isTracking': true,
                                        'nextRotation': date,
                                        },
                                    });
                            await interaction.update({ content: `Your rotation tracking was successfully reset.\n Next rotation on ${time(date)}.`, components: [], ephemeral: true });
                        }
                        else if (i.customId == 'base_tracking-reset-cancel')
                            await interaction.update({ content: 'Your rotaition tracking remains the same.', components: [], ephemeral: true });
                    }
                });
            }
            else {
                const date = new Date();
                date.setTime(date.getTime() + schedule.rotations[0] * 60 * 60000);
                await client.mongoClient
                    .db()
                    .collection('base_schedule')
                    .updateOne(
                        { userId: interaction.user.id },
                        { $set: {
                            'currentRotationIndex': 0,
                            'isTracking': true,
                            'nextRotation': date,
                            },
                        });
                await interaction.reply({ content: `Base tracking started.\nYou'll get a notification for your next rotation on ${time(date)}.`, ephemeral: true });
            }
        }
        else
            await interaction.reply({ content: 'No base schedule found for this user.\nPlease use /set-schedule to set your schedule layout first.', ephemeral: true });
	},
};