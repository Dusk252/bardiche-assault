const { SlashCommandBuilder } = require('discord.js');
const { evaluate } = require('mathjs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('calc')
		.setDescription('Calculates the result of a given mathematical expression')
        .addStringOption(option => option.setName('expr').setDescription('Expression').setRequired(true)),
	async execute(interaction) {
        const expr = interaction.options.getString('expr');
        try {
            const res = evaluate(expr);
            await interaction.reply(`\`\`${expr.split(/([+*/x-])/).join(' ')} = ${res}\`\``);
        }
        catch {
            await interaction.reply('Invalid expression.');
        }
	},
};