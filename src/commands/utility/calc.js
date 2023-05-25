const { SlashCommandBuilder } = require('discord.js');
const { evaluate } = require('mathjs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('calc')
		.setDescription('Calculates the result of a given mathematical expression')
        .addStringOption(option => option.setName('expr').setDescription('Expression').setRequired(true))
        .addBooleanOption(option => option.setName('show').setDescription('Whether to show the bot reply in channel.')),
	async execute(interaction) {
        const expr = interaction.options.getString('expr');
        const show = interaction.options.getBoolean('show');
        try {
            const res = evaluate(expr);
            await interaction.reply({ content: `\`\`${expr.split(/([+*/x-])/).join(' ')} = ${res}\`\``, ephemeral: show !== true });
        }
        catch {
            await interaction.reply({ content: 'Invalid expression.', ephemeral: true });
        }
	},
};