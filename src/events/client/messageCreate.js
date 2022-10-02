module.exports = {
    name: 'messageCreate',
    execute: async (message) => {
        if (message.content.startsWith('Bardiche'))
        message.reply('``YES SIR!``');
    },
};