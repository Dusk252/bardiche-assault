const { evaluate } = require('mathjs');
const { calcTheoreticalAtkInterval, calcActualAtkInterval } = require('../../../helpers/dmgCalc/calcs');

module.exports = {
    data: subcommand => subcommand
        .setName('atk-interval')
        .setDescription('Calc atk interval taking into account aspd buffs and interval modifiers.')
        .addStringOption(option => option.setName('atk-interval').setDescription('Base attack interval.')
        .setRequired(true))
        .addStringOption(option => option.setName('aspd-mod').setDescription('Aspd buffs/debuffs.'))
        .addStringOption(option => option.setName('atk-interval-mod').setDescription('Attack interval modifiers.')),
	async execute(interaction) {
        const atkInterval = interaction.options.getString('atk-interval');
        const aspdMod = interaction.options.getString('aspd-mod');
        const atkIntervalMod = interaction.options.getString('atk-interval-mod');

        const results = await Promise.all([tryEval(atkInterval), tryEval(aspdMod), tryEval(atkIntervalMod)])
            .then((values) => ({ values, error: null }))
            .catch((err) => ({ values: null, error: err }));
        if (results.error) {
            await interaction.reply({ content: results.error });
            return;
        }
        const theoreticalAtkInterval = calcTheoreticalAtkInterval(...results.values);
        const frames = Math.round(theoreticalAtkInterval * 30);
        const actualAtkInterval = calcActualAtkInterval(theoreticalAtkInterval);
        const hitsPerSecond = parseFloat((1 / actualAtkInterval).toFixed(3));
        await interaction.reply({ content: `\`\`Actual atk interval: ${parseFloat(actualAtkInterval.toFixed(3))} s / ${frames} frames\`\`\n\`\`Attacks per second: ${hitsPerSecond}\`\`` });
	},
};

const tryEval = (param) => new Promise((resolve, reject) => {
    if (!param)
        resolve(0);
    try {
        const value = evaluate(param);
        resolve(value);
    }
    catch {
        reject('One of the parameter expressions was invalid.');
    }
});