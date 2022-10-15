const { SlashCommandBuilder } = require('discord.js');
const checkSchedule = require('./subcommands/checkSchedule');
const getTemplate = require('./subcommands/getTemplate');
const getTemplateInstructions = require('./subcommands/getTemplateInstructions');
const setSchedule = require('./subcommands/setSchedule');
const startTracking = require('./subcommands/startTracking');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('base')
		.setDescription('Base commands.')
		.addSubcommand(checkSchedule.data)
		.addSubcommand(getTemplate.data)
        .addSubcommand(getTemplateInstructions.data)
        .addSubcommand(setSchedule.data)
        .addSubcommand(startTracking.data),
	async execute(interaction, client) {
		switch (interaction.options.getSubcommand()) {
			case 'check-schedule':
				await checkSchedule.execute(interaction, client);
				break;
			case 'get-template':
				await getTemplate.execute(interaction, client);
				break;
            case 'get-template-instructions':
                await getTemplateInstructions.execute(interaction, client);
                break;
            case 'set-schedule':
                await setSchedule.execute(interaction, client);
                break;
            case 'start-tracking':
                await startTracking.execute(interaction, client);
                break;
			default:
				await interaction.reply({ content: '``This subcommand does not exist.``', ephemeral: true });
		}
	},
};