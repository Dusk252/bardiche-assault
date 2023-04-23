const { evaluate } = require('mathjs');
const { calcPhysDmgHit, calcArtsDmgHit } = require('../../../helpers/dmgCalc/calcs');

module.exports = {
    data: subcommand => subcommand
        .setName('dph')
        .setDescription('Calc damage per hit based on atk, dmg type, and enemy defenses.')
        .addStringOption(option => option.setName('dmg-type').setDescription('Damage type (phys or arts).')
        .setRequired(true)
        .addChoices({ name: 'phys', value: 'phys' }, { name: 'arts', value: 'arts' }))
        .addStringOption(option => option.setName('atk').setDescription('Base atk.')
        .setRequired(true))
        .addStringOption(option => option.setName('enemy-def-or-res').setDescription('Enemy def/res.')
        .setRequired(true))
        .addStringOption(option => option.setName('atk-scale-modifier').setDescription('Atk scale modifers.'))
        .addStringOption(option => option.setName('def-res-ignore').setDescription('Def/res ignore (%).'))
        .addStringOption(option => option.setName('flat-def-res-ignore').setDescription('Def/res ignore (flat).'))
        .addStringOption(option => option.setName('dmg-modifier').setDescription('Damage amplification, fragile, etc.')),
	async execute(interaction) {
        const dmgType = interaction.options.getString('dmg-type');
        const atk = interaction.options.getString('atk');
        const enemyDefRes = interaction.options.getString('enemy-def-or-res');
        const atkModifier = interaction.options.getString('atk-scale-modifier');
        const defResIgnore = interaction.options.getString('def-res-ignore');
        const flatResDefIgnore = interaction.options.getString('flat-def-res-ignore');
        const dmgModifier = interaction.options.getString('dmg-modifier');

        const results = await Promise.all([tryEval(atk), tryEval(enemyDefRes), tryEval(atkModifier), tryEval(defResIgnore), tryEval(flatResDefIgnore), tryEval(dmgModifier)])
            .then((values) => ({ values, error: null }))
            .catch((err) => ({ values: null, error: err }));
        if (results.error) {
            await interaction.reply({ content: results.error });
            return;
        }

        switch (dmgType) {
            case 'phys':
                await interaction.reply({ content: `\`\`Dph: ${calcPhysDmgHit(...results.values)}\`\`` });
                return;
            case 'arts':
                await interaction.reply({ content: `\`\`Dph: ${calcArtsDmgHit(...results.values)}\`\`` });
                return;
            default:
                await interaction.reply({ content: 'Invalid dmg type.' });
                return;
        }
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