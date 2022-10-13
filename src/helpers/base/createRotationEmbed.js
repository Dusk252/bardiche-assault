const { EmbedBuilder, time } = require('discord.js');
const { table } = require('table');

const getFacilityField = (rotationTime, facility, isTracking, isNotif) => {
    const field = {
        name: '',
        value: isNotif ? '```diff\n' : '```markdown\n',
        inline: false,
    };
    const fieldValueData = [];
    const tableConfig = {
        drawVerticalLine: (lineIndex) => {
          return lineIndex === 1;
        },
        drawHorizontalLine: () => false,
        columns: [
            {
              paddingLeft: 0,
            },
        ],
      };
    switch (facility.type) {
        case 'cc':
            field.name = '<:control_center:1028426188496052304>  Control Center';
            break;
        case 'factory':
            field.name = '<:factory:1028426191113297940>  Factory';
            break;
        case 'tp':
            field.name = '<:trading_post:1028426189842432020>  Trading Post';
            break;
        case 'pp':
            field.name = '<:power_plant:1028426187296489612>  Power Plant';
            break;
        case 'hr':
            field.name = '<:hr:1028426186050764851>  HR';
            break;
        case 'rr':
            field.name = '<:rr:1028426184347893891>  Reception Room';
            break;
        case 'dorm':
            field.name = '<:dorm:1029036850330992670>  Dorm';
            break;
        default:
            field.name = 'Unknown Facility';
            break;
    }
    let timeSlot = 0;
    for (let i = 0; i < facility.rotations.length; i++) {
        if (isNotif && (i == facility.currentIndex
            || i == (facility.currentIndex + 1 < facility.rotations.length ? facility.currentIndex + 1 : 0))) {
            if (i == facility.currentIndex)
                fieldValueData.push([`- ${timeSlot}`, ...facility.rotations[i]]);
            else
                fieldValueData.push([`+ ${timeSlot}`, ...facility.rotations[i]]);
        }
        else if (!isNotif) {
            if (isTracking && i == facility.currentIndex)
                fieldValueData.push([`#${timeSlot}`, ...facility.rotations[i]]);
            else
                fieldValueData.push([`${timeSlot}`, ...facility.rotations[i]]);
        }
        timeSlot += rotationTime[i < rotationTime.length ? i : 0];
    }
    field.value += table(fieldValueData, tableConfig);
    field.value += '\n```';
    return field;
};

module.exports = {
    getScheduleEmbed(schedule, user) {
        const embed = new EmbedBuilder()
            .setTitle('Base schedule')
            .setAuthor({
                iconURL: user.avatarURL(),
                name: user.tag,
            });
        if (schedule.isTracking)
            embed.setDescription(`Next rotation on: ${time(schedule.nextRotation)}`);
        else
            embed.setDescription('Rotation tracker not currently active. Use the /start-tracking command to start.');
        const fields = [];
        for (const facility of schedule.layout)
            fields.push(getFacilityField(schedule.rotations, facility, schedule.isTracking, false));
        embed.addFields(fields);
        return embed;
    },
    getRotationEmbed(schedule, user, nextRotation) {
        const embed = new EmbedBuilder()
            .setTitle('Base rotation notif')
            .setAuthor({
                iconURL: user.avatarURL(),
                name: user.tag,
            })
            .setDescription(`Rotation on: ${time(schedule.nextRotation)}\nNext rotation on: ${time(nextRotation)}`);
        const fields = [];
        for (const facility of schedule.layout)
            fields.push(getFacilityField(schedule.rotations, facility, schedule.isTracking, true));
        embed.addFields(fields);
        return embed;
    },
};