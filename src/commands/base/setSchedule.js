const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const validate = require('./../../helpers/validateSchema');

const schema = {
    type: 'object',
    properties: {
        rotationTime: { type: 'array', minItems: 1, items: { type: 'integer' } },
        cc: { type: 'array', items: { type: 'string' } },
        factories: { type: 'array', items: { type: 'string' } },
        tp: { type: 'array', items: { type: 'string' } },
        hr: { type: 'array', items: { type: 'string' } },
        reception: { type: 'array', items: { type: 'string' } },
        dorms: { type: 'array', items: { type: 'string' } },
    },
    required: ['rotationTime'],
    additionalProperties: false,
};

const fillBaseSchedule = async (schedule, userId, serverId, mongoClient) => {
    const transactionOptions = {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
    };
    const session = mongoClient.startSession();
    try {
        session.startTransaction(transactionOptions);
        const { rotationTime, ...rawLayout } = schedule;
        const layout = Object.keys(rawLayout).reduce((res, cur) => {
            res[cur] = { layout: layout[cur], currentIndex: 0 };
            return res;
        }, {});
        await mongoClient
            .db()
            .collection('base_schedule')
            .insertOne({
                userId,
                serverId,
                rotations: rotationTime,
                currentRotationIndex: 0,
                tracking: false,
                nextRotation: null,
            }, { session });
        await mongoClient
            .db()
            .collection('base_layout')
            .insertOne({
                userId,
                serverId,
                layout,
            }, { session });
        await session.commitTransaction();
    }
    catch (err) {
        console.log(err);
        await session.abortTransaction();
        throw 'transactionError';
    }
    finally {
        await session.endSession();
    }
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-schedule')
		.setDescription('Get a .json template to submit your base schedule to the bot.')
        .addAttachmentOption((option => option.setName('schedule')
            .setDescription('A .json file with the options according to the template gotten with the /getTemplate command.')
            .setRequired(true))),
	async execute(interaction, client) {
        const attachment = interaction.options.getAttachment('schedule');
        if (!attachment || !attachment.contentType.includes('application/json'))
            await interaction.reply({ content: 'Please attach a valid .json file.', ephemeral: true });
        try {
            const res = await fetch(attachment.url);
            if (res.status != 200)
                throw 'Unexpected server response.';
            const body = await res.json();
            const valid = validate(schema, body);
            if (!valid)
                await interaction.reply({ content: 'Template filled incorrectly, please recheck the instructions using the /get-template-instructions command.', ephemeral: true });
            else {
                try {
                    fillBaseSchedule(body, interaction.user.id, interaction.guildId, client.mongoClient);
                    await interaction.reply({ content: 'Base schedule submitted successfully.\nOnce you have your rotation in the game use /start-track to start tracking the time with this layout.' });
                }
                catch {
                    await interaction.reply({ content: 'There was an error saving your information in the database, please try again.', ephemeral: true });
                }
            }
        }
        catch {
            await interaction.reply({ content: 'There was an error fetching your file, please try again.', ephemeral: true });
        }
	},
};