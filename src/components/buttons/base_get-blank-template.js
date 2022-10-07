const { AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const path = require('node:path');

const button = new ButtonBuilder()
    .setCustomId('base_get-template-instructions')
    .setLabel('Show Instructions')
    .setStyle(ButtonStyle.Primary);

module.exports = {
    data: {
        name: 'base_get-blank-template',
    },
    async execute(interaction) {
        const templatePath = path.join(__dirname, '../../../files/blank.json');
        const attachment = new AttachmentBuilder(templatePath, 'blank.json');
        await interaction.update({ components:[new ActionRowBuilder().addComponents(button)], files: [attachment] });
    },
};