module.exports = {
    name: 'messageCreate',
    execute: async (message) => {
        if (message.content.startsWith('Bardiche'))
            await message.reply('``YES SIR!``');
        else if (/^http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/.test(message.content))
            await message.reply({ content: message.content.replace('e', 'p'), allowedMentions: { repliedUser: false } });
    },
};