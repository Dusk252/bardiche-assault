const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const validate = require('./../../helpers/base/validateSchema');

const customKeywords = [
    {
        keyword: 'checkFacilityCount',
        schemaType: 'boolean',
        code(cxt) {
            const { data, schema } = cxt;
            let facilityCount = {};
            if (schema) {
                facilityCount = Object.keys(data).reduce((prev, f) => {
                    if (f.type === 'factory' || f.type === 'tp' || f.type === 'pp')
                        prev.leftSide = prev.leftSide + 1;
                    else
                        prev[f.type] = prev[f.type] + 1;
                    return prev;
                }, { leftSide: 0, cc: 0, hr: 0, dorm: 0, rr: 0 });
            }
            cxt.fail(schema && (facilityCount.leftSide > 9 || facilityCount.cc > 1 || facilityCount.dorm > 4 || facilityCount.hr > 1 || facilityCount.rr > 1));
        },
    },
];

const schema = {
    type: 'object',
    properties: {
        rotationTime: { type: 'array', minItems: 1, items: { type: 'integer' } },
        facilities: { type: 'array', checkFacilityCount: true, items: { type: 'object', properties: {
            rotations: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
            type: { type: 'string', enum: ['cc', 'factory', 'tp', 'rr', 'hr', 'dorm', 'pp'] },
         } } },
    },
    required: ['rotationTime'],
    additionalProperties: false,
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-schedule')
		.setDescription('Get a .json template to submit your base schedule to the bot.')
        .addAttachmentOption((option => option.setName('schedule')
            .setDescription('A .json file with the options according to the template gotten with the /getTemplate command.')
            .setRequired(true)))
        .addBooleanOption((option => option.setName('reset-tracking')
            .setDescription('Sets tracking back to false and resets rotation index. Use /start-tracking to start tracking again.'))),
	async execute(interaction, client) {
        const attachment = interaction.options.getAttachment('schedule');
        const resetTracking = interaction.options.getBoolean('reset-tracking');
        if (!attachment || !attachment.contentType.includes('application/json'))
            await interaction.reply({ content: 'Please attach a valid .json file.', ephemeral: true });
        try {
            const res = await fetch(attachment.url);
            if (res.status != 200)
                throw 'Unexpected server response.';
            const body = await res.json();
            const valid = validate(schema, body, customKeywords);
            if (!valid)
                await interaction.reply({ content: 'Template filled incorrectly, please recheck the instructions using the /get-template-instructions command.', ephemeral: true });
            else {
                try {
                    const { rotationTime, facilities } = body;
                    for (const facility of facilities)
                        facility.currentIndex = 0;
                    const query = { userId: interaction.user.id };
                    const update = {
                        userId: interaction.user.id,
                        rotations: rotationTime,
                        layout: facilities,
                    };
                    if (resetTracking) {
                        update.currentRotationIndex = 0;
                        update.isTracking = false;
                        update.nextRotation = null;
                    }
                    await client.mongoClient
                        .db()
                        .collection('base_schedule')
                        .updateOne(query, update, { upsert: true });
                    await interaction.reply({ content: 'Base schedule submitted successfully.\nOnce you have your rotation in the game use /start-track to start tracking the time with this layout.', ephemeral: true });
                }
                catch (err) {
                    console.log(err);
                    await interaction.reply({ content: 'There was an error saving your information in the database, please try again.', ephemeral: true });
                }
            }
        }
        catch (err) {
            console.log(err);
            await interaction.reply({ content: 'There was an error fetching your file, please try again.', ephemeral: true });
        }
	},
};