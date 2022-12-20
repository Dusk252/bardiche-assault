const { channelMention } = require('discord.js');
const { table } = require('table');

module.exports = {
    getTwitterFeedsTable(feeds) {
        const tableConfig = {
            drawHorizontalLine: () => false,
            drawVerticalLine: (lineIndex, columnCount) => lineIndex != 0 && lineIndex != columnCount,
            columns: [
                {
                  paddingLeft: 0,
                },
            ],
        };
        const fieldValueData = feeds.map(feed => ([ `${feed.twitterHandle}`, `${channelMention(feed.channelId)}` ]));
        return `${table(fieldValueData, tableConfig)}`;
    },
};