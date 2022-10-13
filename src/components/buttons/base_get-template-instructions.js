const createInstructionsEmbed = require('../../helpers/base/createInstructionsEmbed');

const instructionsEmbed = createInstructionsEmbed();

module.exports = {
    data: {
        name: 'base_get-template-instructions',
    },
    async execute(interaction) {
        await interaction.update({ components:[], embeds: [instructionsEmbed] });
    },
};