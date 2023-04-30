const { evaluate } = require('mathjs');
const { calcPhysDmgHit, calcArtsDmgHit, calcActualAtkInterval, calcTheoreticalAtkInterval } = require('../../../helpers/dmgCalc/calcs');

module.exports = {
    data: subcommand => subcommand
        .setName('dps')
        .setDescription('Calc damage per second based on atk, atk interval, dmg type, and enemy defenses.')
        .addStringOption(option => option.setName('dmg-type').setDescription('Damage type (phys or arts).')
        .setRequired(true)
        .addChoices({ name: 'phys', value: 'phys' }, { name: 'arts', value: 'arts' }))
        .addStringOption(option => option.setName('atk').setDescription('Base atk.')
        .setRequired(true))
        .addStringOption(option => option.setName('enemy-def-or-res').setDescription('Enemy def/res.')
        .setRequired(true))
        .addStringOption(option => option.setName('atk-interval').setDescription('Base attack interval.')
        .setRequired(true))
        .addStringOption(option => option.setName('aspd-mod').setDescription('Aspd buffs/debuffs.'))
        .addStringOption(option => option.setName('atk-interval-mod').setDescription('Attack interval modifiers.'))
        .addStringOption(option => option.setName('atk-scale-modifier').setDescription('Atk scale modifers.'))
        .addStringOption(option => option.setName('def-res-ignore').setDescription('Def/res ignore (%).'))
        .addStringOption(option => option.setName('flat-def-res-ignore').setDescription('Def/res ignore (flat).'))
        .addStringOption(option => option.setName('dmg-modifier').setDescription('Damage amplification, fragile, etc.'))
        .addStringOption(option => option.setName('enemy-count').setDescription('Enemy count.')),
	async execute(interaction) {
        const dmgType = interaction.options.getString('dmg-type');
        const atk = interaction.options.getString('atk');
        const enemyDefRes = interaction.options.getString('enemy-def-or-res');
        const atkModifier = interaction.options.getString('atk-scale-modifier');
        const defResIgnore = interaction.options.getString('def-res-ignore');
        const flatResDefIgnore = interaction.options.getString('flat-def-res-ignore');
        const dmgModifier = interaction.options.getString('dmg-modifier');
        const atkInterval = interaction.options.getString('atk-interval');
        const aspdMod = interaction.options.getString('aspd-mod');
        const atkIntervalMod = interaction.options.getString('atk-interval-mod');

        const dmgCalcParams = await Promise.all([tryEval(atk), tryEval(enemyDefRes), tryEval(atkModifier), tryEval(defResIgnore), tryEval(flatResDefIgnore), tryEval(dmgModifier)])
            .then((values) => ({ values, error: false }))
            .catch(() => ({ values: null, error: true }));

        const atkIntervalParams = await Promise.all([tryEval(atkInterval), tryEval(aspdMod), tryEval(atkIntervalMod)])
            .then((values) => ({ values, error: null }))
            .catch(() => ({ values: null, error: true }));

        if (dmgCalcParams.error || atkIntervalParams.error) {
            await interaction.reply({ content: 'One of the parameter expressions was invalid.' });
            return;
        }

        const theoreticalAtkInterval = calcTheoreticalAtkInterval(...atkIntervalParams.values);
        const actualAtkInterval = calcActualAtkInterval(theoreticalAtkInterval);

        let content = '';
        switch (dmgType) {
            case 'phys':
                content = `\`\`Dps: ${parseFloat(calcPhysDmgHit(...dmgCalcParams.values) / actualAtkInterval).toFixed(3)}\`\``;
                break;
            case 'arts':
                content = `\`\`Dps: ${parseFloat(calcArtsDmgHit(...dmgCalcParams.values) / actualAtkInterval).toFixed(3)}\`\`` ;
                break;
            default:
                content = 'Invalid dmg type.';
                break;
        }
        await interaction.reply({ content });
        return;
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
        reject();
    }
});