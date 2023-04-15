const initializeTwitterStream = require('../../helpers/twitter/initializeTwitterStream');

module.exports = async (client) => {
    if (!client.twitterClient) {
        console.log('Could not initialize twitter client.');
        return;
    }
    client.twitterClient.appClient = await client.twitterClient.userClient.appLogin();
    const twitterFeeds = await client.mongoClient
            .db()
            .collection('twitter_feed')
            .find().toArray();
    if (!twitterFeeds)
        return;
    const rules = twitterFeeds.map((feed) => ({ value: `from:${feed.twitterId}` }));
    await client.twitterClient.appClient.v2.updateStreamRules({
        add: rules,
    });
    await initializeTwitterStream(client);
    console.log('Twitter feed initialized.');
};