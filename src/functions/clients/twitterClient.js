const { TwitterApi } = require('twitter-api-v2');

module.exports = async (client) => {
    const userClient = new TwitterApi({ appKey: process.env.TWITTER_KEY, appSecret: process.env.TWITTER_SECRET });
    client.twitterClient = { userClient, appClient: null };
};