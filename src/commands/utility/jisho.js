const { SlashCommandBuilder } = require('discord.js');
const JishoAPI = require('unofficial-jisho-api');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jisho')
		.setDescription('Searches the definition of a word on jisho.org')
        .addStringOption(option => option.setName('word').setDescription('Word to search for.').setRequired(true))
        .addIntegerOption(option => option.setName('results').setDescription('Number of results to return.')),
	async execute(interaction) {
        const word = interaction.options.getString('word');
        const res = interaction.options.getInteger('results') ?? 1;
        const jisho = new JishoAPI();
		const result = await jisho.searchForPhrase(word);
		if (!result || !result.meta || result.meta.status != 200) {
			await interaction.reply('``There was an issue querying jisho. Please try again later.``');
			return;
		}
		let reply = '```';
		result.data.slice(0, res).map(d => {
			reply += `${d.slug} 【${d.japanese[0].reading}】\n\n`;
			const partOfSpeechSet = new Set();
			let definitionList = '';
			for (const n in d.senses) {
				definitionList += `${parseInt(n) + 1}. ${d.senses[n].english_definitions.join(', ')}\n`;
				for (const p of d.senses[n].parts_of_speech)
					partOfSpeechSet.add(p.replace(/\s\(.*?\)/g, ''));
			}
			if (partOfSpeechSet.length > 0)
				reply += `(${[...partOfSpeechSet].join(', ')})\n`;
			reply += definitionList;
			const otherForms = d.japanese.splice(1);
			if (otherForms.length) {
				reply += '\nOther forms:\n';
				otherForms.map(i => {
					if (i.word)
						reply += `${i.word} [${i.reading}], `;
					else
						reply += `${i.reading}, `;
				});
				reply = reply.slice(0, -2);
			}
			reply += '\n-----------------------\n\n';
		});
		reply += '```';
		await interaction.reply(reply);
	},
};