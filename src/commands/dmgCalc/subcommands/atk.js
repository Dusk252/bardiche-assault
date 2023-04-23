const { evaluate } = require('mathjs');
const { calcAtk } = require('../../../helpers/dmgCalc/calcs');

module.exports = {
    data: subcommand => subcommand
        .setName('atk')
        .setDescription('Calc atk stat based on base atk and buffs / debuffs. Modifiers can be written as expressions.')
        .addIntegerOption(option => option.setName('atk').setDescription('Base atk')
        .setMinValue(0)
        .setRequired(true))
        .addStringOption(option => option.setName('atk-modifier').setDescription('Atk % buffs.'))
        .addStringOption(option => option.setName('flat-modifier').setDescription('Bard buffs, other flat modifiers.'))
        .addStringOption(option => option.setName('stage-modifier').setDescription('CC risks, CM modifiers (%).'))
        .addStringOption(option => option.setName('debuff-modifier').setDescription('Most atk % debuffs.')),
	async execute(interaction) {
        const atk = interaction.options.getInteger('atk');
        const atkModifier = interaction.options.getString('atk-modifier');
        const flatModifier = interaction.options.getString('flat-modifier');
        const stageModifier = interaction.options.getString('stage-modifier');
        const debuffModifier = interaction.options.getString('debuff-modifier');

        const results = await Promise.all([tryEval(atkModifier), tryEval(flatModifier), tryEval(stageModifier), tryEval(debuffModifier)])
            .then((values) => ({ values, error: null }))
            .catch((err) => ({ values: null, error: err }));
        if (results.error) {
            await interaction.reply({ content: results.error });
            return;
        }
        const finalAttack = calcAtk(atk, ...results.values);
        await interaction.reply({ content: `\`\`Final atk: ${finalAttack}\`\`` });
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