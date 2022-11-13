const { AttachmentBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'base_get-current-setup',
    },
    async execute(interaction, client) {
        const currentSetup = await client.mongoClient
            .db()
            .collection('base_schedule')
            .findOne({ userId: interaction.user.id });
        if (!currentSetup) {
            await interaction.update({ components: [], content: 'You do not have a base layout saved.', ephemeral: true });
            return;
        }
        const jsonAttachment = {
            rotationTime: currentSetup.rotations,
            facilities: currentSetup.layout.map(l => ({ rotations: l.rotations, type: l.type })),
        };
        const attachment = new AttachmentBuilder()
            .setFile(Buffer.from(JSON.stringify(jsonAttachment)))
            .setName('current.json');
        await interaction.update({ components: [], files: [attachment], ephemeral: true });
    },
};