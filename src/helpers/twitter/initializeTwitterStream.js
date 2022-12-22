const { ETwitterStreamEvent } = require('twitter-api-v2');

module.exports = async (client) => {
    const stream = client.twitterClient.appClient.v2.searchStream({ autoConnect: false, expansions: 'author_id', 'user.fields': ['id'] });
    stream.on(
        ETwitterStreamEvent.Data,
        async eventData => {
            const feeds = await client.mongoClient
                .db()
                .collection('twitter_feed')
                .find({ twitterId: eventData.data.author_id })
                .toArray();
            if (!feeds)
                return;
            for (const feed of feeds) {
                const channel = await client.channels.fetch(feed.channelId);
                if (channel && channel.isTextBased())
                    channel.send({ content: `https://twitter.com/${eventData.includes.users[0].username}/status/${eventData.data.id}` });
            }
        },
    );
    stream.on(ETwitterStreamEvent.ConnectionError, (err) =>
        console.log('Twitter stream connection error!', err),
    );
    stream.on(
        ETwitterStreamEvent.ConnectionClosed,
        () => console.log('Twitter stream connection has been closed.'),
    );
    await stream.connect({ autoReconnect: true, autoReconnectRetries: Infinity });
    client.twitterClient.stream = stream;
};