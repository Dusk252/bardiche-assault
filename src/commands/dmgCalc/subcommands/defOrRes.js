const { evaluate } = require('mathjs');
const { calcDefOrRes } = require('../../../helpers/dmgCalc/calcs');

module.exports = {
    data: subcommand => subcommand
        .setName('def-or-res')
        .setDescription('Calc def/res based on def/res modifiers.')
        .addIntegerOption(option => option.setName('def-or-res').setDescription('Base def/res')
        .setMinValue(0)
        .setRequired(true))
        .addStringOption(option => option.setName('buff-modifier').setDescription('Def or res % buffs.'))
        .addStringOption(option => option.setName('flat-modifier').setDescription('Flat debuffs, talent buffs, etc.'))
        .addStringOption(option => option.setName('stage-modifier').setDescription('CC risks, CM modifiers (%).'))
        .addStringOption(option => option.setName('flat-stage-modifier').setDescription('CC risks, CM modifiers (flat).'))
        .addStringOption(option => option.setName('final-flat-modifier').setDescription('Bard buffs, Chalter s3. No examples for res.'))
        .addStringOption(option => option.setName('debuff-modifier').setDescription('Def or res % debuff.')),
	async execute(interaction) {
        const def = interaction.options.getInteger('def-or-res');
        const defBuff = interaction.options.getString('buff-modifier');
        const flatModifier = interaction.options.getString('flat-modifier');
        const stageModifier = interaction.options.getString('stage-modifier');
        const flatStageModifier = interaction.options.getString('flat-stage-modifier');
        const finalFlatModifier = interaction.options.getString('final-flat-modifier');
        const defDebuff = interaction.options.getString('debuff-modifier');

        const results = await Promise.all([tryEval(defBuff), tryEval(flatModifier), tryEval(stageModifier), tryEval(flatStageModifier), tryEval(finalFlatModifier), tryEval(defDebuff)])
            .then((values) => ({ values, error: null }))
            .catch((err) => ({ values: null, error: err }));
        if (results.error) {
            await interaction.reply({ content: results.error });
            return;
        }
        const defOrRes = calcDefOrRes(def, ...results.values);
        await interaction.reply({ content: `\`\`${defOrRes}\`\`` });
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