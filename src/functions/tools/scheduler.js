const { ChannelType, userMention } = require('discord.js');
const cron = require('node-cron');

module.exports = (client) => {
    cron.schedule('* * * * *', async () => {
        const processedReminders = [];
        const reminders = await client.mongoClient
            .db()
            .collection('reminders')
            .find({ dateTime: { $lte: new Date() } }).toArray();
        await Promise.all(reminders.map(async (reminder) => {
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
        // const processedReminders = [];
        // const reminders = await client.mongoClient
        //     .db()
        //     .collection('base_schedule')
        //     .find({ tracking: true, nextRotation: { $lte: new Date() } }).toArray();
        // await Promise.all(reminders.map(async (reminder) => {
        //     const channel = await client.channels.fetch(reminder.channelId);
        //     if (channel.type === ChannelType.GuildText)
        //         await channel.send(`${userMention(reminder.userId)}` + ` \`\`${reminder.content}\`\``);
        //     processedReminders.push(reminder._id);
        // }));
        // await client.mongoClient
        //     .db()
        //     .collection('reminders')
        //     .deleteMany({ _id: { $in: processedReminders } });
    });
};