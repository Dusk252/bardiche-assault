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
        .addStringOption(option => option.setName('dmg-modifier').setDescription('Damage amplification, fragile, etc.'))
        .addBooleanOption(option => option.setName('show').setDescription('Whether to show the bot reply in channel.')),
	async execute(interaction) {
        const dmgType = interaction.options.getString('dmg-type');
        const atk = interaction.options.getString('atk');
        const enemyDefRes = interaction.options.getString('enemy-def-or-res');
        const atkModifier = interaction.options.getString('atk-scale-modifier');
        const defResIgnore = interaction.options.getString('def-res-ignore');
        const flatResDefIgnore = interaction.options.getString('flat-def-res-ignore');
        const dmgModifier = interaction.options.getString('dmg-modifier');
        const show = interaction.options.getBoolean('show');

        const results = await Promise.all([tryEval(atk), tryEval(enemyDefRes), tryEval(atkModifier), tryEval(defResIgnore), tryEval(flatResDefIgnore), tryEval(dmgModifier)])
            .then((values) => ({ values, error: null }))
            .catch(() => ({ values: null, error: true }));
        if (results.error) {
            await interaction.reply({ content: 'One of the parameter expressions was invalid.', ephemeral: true });
            return;
        }

        let content = '';
        switch (dmgType) {
            case 'phys':
                content = `\`\`Dph: ${calcPhysDmgHit(...results.values)}\`\``;
                break;
            case 'arts':
                content = `\`\`Dph: ${calcArtsDmgHit(...results.values)}\`\`` ;
                break;
            default:
                content = 'Invalid dmg type.';
                break;
        }
        await interaction.reply({ content, ephemeral: show !== true });
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