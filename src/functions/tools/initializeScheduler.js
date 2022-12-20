const { ChannelType, userMention } = require('discord.js');
const { getRotationEmbed } = require('../../helpers/base/createRotationEmbed');
const cron = require('node-cron');

module.exports = (client) => {
    cron.schedule('* * * * *', async () => {
        const processedReminders = [];
        const reminders = await client.mongoClient
            .db()
            .collection('reminders')
            .find({ dateTime: { $lte: new Date() } }).toArray();
        await Promise.allSettled(reminders.map(async (reminder) => {
            const channel = await client.channels.fetch(reminder.channelId);
            if (channel.type === ChannelType.GuildText)
                await channel.send(`${userMention(reminder.userId)}` + ` \`\`${reminder.content}\`\``);
            processedReminders.push(reminder._id);
        }));
        await client.mongoClient
            .db()
            .collection('reminders')
            .deleteMany({ _id: { $in: processedReminders } });
    });

    cron.schedule('* * * * *', async () => {
        const processedReminders = [];
        const date = new Date();
        const reminders = await client.mongoClient
            .db()
            .collection('base_schedule')
            .find({ isTracking: true, nextRotation: { $lte: date } }).toArray();
        await Promise.allSettled(reminders.map(async (reminder) => {
            const nextRotationIndex = reminder.currentRotationIndex + 1 < reminder.rotations.length ? reminder.currentRotationIndex + 1 : 0;
            const nextRotation = new Date(date.getTime() + reminder.rotations[nextRotationIndex] * 60 * 60000);
            const user = await client.users.fetch(reminder.userId);
            const rotationEmbed = getRotationEmbed(reminder, user, nextRotation);
            const message = await client.users.send(reminder.userId, { embeds: [rotationEmbed] });
            if (message) {
                const arrayUpdates = reminder.layout.reduce((acc, layout, index) => {
                    const key = `layout.${index}.currentIndex`;
                    acc[key] = layout.currentIndex + 1 < layout.rotations.length ? layout.currentIndex + 1 : 0;
                    return acc;
                }, {});
                processedReminders.push({
                    updateOne: {
                        filter: { _id: reminder._id },
                        update: { $set: { currentRotationIndex: nextRotationIndex, nextRotation: nextRotation, ...arrayUpdates } },
                    },
                });
            }
            else
                throw new Error('Unable to message user.');
        }));
        if (processedReminders.length) {
            await client.mongoClient
                .db()
                .collection('base_schedule')
                .bulkWrite(processedReminders);
        }
    });
};