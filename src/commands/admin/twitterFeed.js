const { SlashCommandBuilder, PermissionFlagsBits, channelMention } = require('discord.js');
const { getTwitterFeedsTable } = require('../../helpers/twitter/createTwitterFeedsTable');
const initializeTwitterStream = require('../../helpers/twitter/initializeTwitterStream');
const trimstart = require('lodash.trimstart');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('twitter')
        .setDescription('Base commands.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
            .setName('add-feed')
            .setDescription('Sets up a twitter feed.')
            .addStringOption(option => option.setName('handle').setDescription('Twitter handle of the account to follow.').setRequired(true))
            .addChannelOption(option => option.setName('channel').setDescription('Channel to send the feed notifications to.').setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('show-feeds')
            .setDescription('Show the list of twitter feeds in this server.'))
        .addSubcommand(subcommand => subcommand
            .setName('remove-feed')
            .setDescription('Removes a twitter feed.')
            .addStringOption(option => option.setName('handle').setDescription('Twitter handle of the account to remove.').setRequired(true))),
	async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'add-feed':
                await createNewFeed(interaction, client);
                break;
            case 'show-feeds':
                await showFeed(interaction, client);
                break;
            case 'remove-feed':
                await deleteFeed(interaction, client);
                break;
            default:
                await interaction.reply({ content: `The subcommand ${subcommand} doesn't exist.`, ephemeral: true });
                break;
        }
	},
};

async function createNewFeed(interaction, client) {
    const screenName = trimstart(interaction.options.getString('handle'), '@');
    const channel = interaction.options.getChannel('channel');
    if (screenName && channel) {
        try {
            const user = await client.twitterClient.appClient.v1.user({ screen_name: screenName });
            if (user && user.id_str) {
                const query = { serverId: interaction.guildId, twitterId: user.id_str };
                const update = { $set: { serverId: interaction.guildId, channelId: channel.id, twitterId: user.id_str, twitterHandle: `${screenName}` } };
                const item = await client.mongoClient
                    .db()
                    .collection('twitter_feed')
                    .updateOne(query, update, { upsert: true });
                await client.twitterClient.appClient.v2.updateStreamRules({
                    add: [{ value: `from:${user.id_str}` }],
                });
                if (!client.twitterClient.stream)
                    await initializeTwitterStream(client);
                if (item.upsertedCount === 1)
                    await interaction.reply({ content: `Twitter feed added successfully.\nNew tweets from @${screenName} will be posted in ${channelMention(channel.id)}.`, ephemeral: true });
                else if (item.matchedCount === 1 && item.modifiedCount === 1)
                    await interaction.reply({ content: `Twitter feed updated successfully.\nNew tweets from @${screenName} will now be posted in ${channelMention(channel.id)}.`, ephemeral: true });
                else if (item.matchedCount === 1 && !item.modifiedCount)
                    await interaction.reply({ content: `There is already a feed for tweets from @${screenName} on ${channelMention(channel.id)}.\nNo changes were made.`, ephemeral: true });
            }
            else
                await interaction.reply({ content: 'That user doesn\'t exist. Please type a valid user handle.', ephemeral: true });
        }
        catch (err) {
            console.log(err);
            await interaction.reply({ content: 'There was an error setting up the feed.', ephemeral: true });
        }
        return;
    }
    await interaction.reply({ content: 'Please insert a valid user handle and channel.', ephemeral: true });
}

async function showFeed(interaction, client) {
    const feeds = await client.mongoClient
        .db()
        .collection('twitter_feed')
        .find({ serverId: interaction.guildId })
        .toArray();
    if (feeds && feeds.length) {
        const feedsEmbed = getTwitterFeedsTable(feeds);
        await interaction.reply({
            content: feedsEmbed,
        });
        return;
    }
    await interaction.reply({ content: 'There are no twitter feeds on this server.', ephemeral: true });
}

async function deleteFeed(interaction, client) {
    const screenName = trimstart(interaction.options.getString('handle'), '@');
    try {
        const user = await client.twitterClient.appClient.v1.user({ screen_name: screenName });
        const matchQuery = user && user.id_str ?
            { $or: [{ twitterId: user.id_str }, { twitterHandle: `${screenName}` }] } :
            { twitterHandle: `${screenName}` };
        const feeds = await client.mongoClient
            .db()
            .collection('twitter_feed')
            .aggregate([
                {
                    $match: matchQuery,
                },
                {
                    $group: {
                    _id: '$twitterId',
                    inCurrentServer: {
                        $sum: {
                        $cond: {
                            'if': {
                            $eq: [
                                '$serverId',
                                `${interaction.guildId}`,
                            ],
                            },
                            'then': 1,
                            'else': 0,
                        },
                        },
                    },
                    inOtherServers: {
                        $sum: {
                        $cond: {
                            'if': {
                            $eq: [
                                '$serverId',
                                `${interaction.guildId}`,
                            ],
                            },
                            'then': 0,
                            'else': 1,
                        },
                        },
                    },
                    },
                },
            ])
            .toArray();
        if (!feeds || !(feeds.length)) {
            await interaction.reply({ content: 'No such feed exists in this server.', ephemeral: true });
            return;
        }
        const rules = await client.twitterClient.appClient.v2.streamRules();
        const rulesMap = rules.data.reduce((acc, cur) => {
            acc[trimstart(cur.value, 'from:')] = cur.id;
            return acc;
        }, {});
        const rulesToDelete = feeds.reduce((acc, cur) => {
            if (cur.inCurrentServer) {
                acc.twitterIds.push(cur._id);
                if (!cur.inOtherServers)
                    acc.ruleIds.push(rulesMap[cur._id]);
            }
            return acc;
        }, { twitterIds: [], ruleIds: [] });
        if (!rulesToDelete.ruleIds.length && !rulesToDelete.twitterIds.length) {
            await interaction.reply({ content: 'No such feed exists in this server.', ephemeral: true });
            return;
        }
        if (rulesToDelete.ruleIds.length) {
            await client.twitterClient.appClient.v2.updateStreamRules({
                delete: {
                    ids: rulesToDelete.ruleIds,
                },
            });
        }
        if (rulesToDelete.twitterIds.length) {
            await client.mongoClient
                .db()
                .collection('twitter_feed')
                .deleteMany({ twitterId: { $in: rulesToDelete.twitterIds }, serverId: `${interaction.guildId}` });
        }
        await interaction.reply({ content: 'The feed was deleted successfully.', ephemeral: true });
    }
    catch (err) {
        await interaction.reply({ content: 'There was an error deleting the feed.', ephemeral: true });
    }
}