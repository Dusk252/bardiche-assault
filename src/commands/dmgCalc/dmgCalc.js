const { SlashCommandBuilder } = require('discord.js');
const atk = require('./subcommands/atk');
const atkInterval = require('./subcommands/atkInterval');
const defOrRes = require('./subcommands/defOrRes');
const dph = require('./subcommands/dph');
// const dps = require('./subcommands/dps');
// const hitCount = require('./subcommands/hitCount');
// const hitsToKill = require('./subcommands/hitsToKill');
// const totalDmg = require('./subcommands/totalDmg');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dmg-calc')
		.setDescription('Arknights damage calculation.')
		.addSubcommand(atk.data)
		.addSubcommand(atkInterval.data)
        .addSubcommand(defOrRes.data)
		.addSubcommand(dph.data),
        // .addSubcommand(dps.data)
        // .addSubcommand(hitCount.data)
        // .addSubcommand(hitsToKill.data)
        // .addSubcommand(totalDmg.data),
	async execute(interaction, client) {
		switch (interaction.options.getSubcommand()) {
			case 'atk':
				await atk.execute(interaction, client);
				break;
			case 'atk-interval':
				await atkInterval.execute(interaction, client);
				break;
            case 'def-or-res':
                await defOrRes.execute(interaction, client);
                break;
			case 'dph':
				await dph.execute(interaction, client);
				break;
            // case 'dps':
            //     await dps.execute(interaction, client);
            //     break;
            // case 'hitCount':
            //     await hitCount.execute(interaction, client);
            //     break;
            // case 'hitsToKill':
            //     await hitsToKill.execute(interaction, client);
            //     break;
            // case 'totalDmg':
            //     await totalDmg.execute(interaction, client);
            //     break;
			default:
				await interaction.reply({ content: '``This subcommand does not exist.``', ephemeral: true });
		}
	},
};