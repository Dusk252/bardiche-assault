const { ETwitterStreamEvent } = require('twitter-api-v2');

module.exports = async (client) => {
    const stream = client.twitterClient.appClient.v2.searchStream({ autoConnect: false, expansions: ['author_id', 'referenced_tweets.id', 'referenced_tweets.id.author_id'], 'user.fields': ['id', 'username'], 'tweet.fields': ['entities', 'referenced_tweets', 'id'] });
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
            const content = processTweetContent(eventData);
            for (const feed of feeds) {
                const channel = await client.channels.fetch(feed.channelId);
                if (channel && channel.isTextBased())
                    channel.send({ content: content });
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

const processTweetContent = (eventData) => {
    let content = `https://twitter.com/${eventData.includes.users[0].username}/status/${eventData.data.id}`;
    let retweetId = null;

    if (eventData.data.referenced_tweets) {
        for (const t of eventData.data.referenced_tweets) {
            if (t.type === 'retweeted') {
                retweetId = t.id;
                break;
            }
        }
    }

    if (retweetId) {
        const { author_id : authorId } = eventData.includes.tweets.find(t => t.id && t.id === retweetId);
        const { username } = eventData.includes.users.find(u => u.id === authorId);
        content = `https://twitter.com/${username}/status/${retweetId}`;
    }

    if (eventData.data.entities && eventData.data.entities.urls) {
        for (const url of eventData.data.entities.urls) {
            if (url.url && !url.expanded_url.startsWith('https://twitter.com'))
                content += `\n${url.url}`;
        }
    }
    return content;
};