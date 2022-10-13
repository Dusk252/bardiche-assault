const { EmbedBuilder } = require('discord.js');

module.exports = () => {
    return new EmbedBuilder()
    .setTitle('Base Template Instructions')
    .setDescription(`Template:\n\`\`\`{
    "rotationTime": [],
    "facilities": [
        {
            "rotations": [
                []
            ],
            "type": ""
        }
    ]\n}\`\`\``)
    .addFields([
        {
            name: 'rotationTime',
            value: `An array with the number of hours between your rotations.
            Rotating every 12 hours:
            \`\`\`"rotationTime": [12]\`\`\`
            Rotating once after 4 hours, then once after 16, then once after 4, and repeat:
            \`\`\`"rotationTime": [4, 16, 4]\`\`\`\n`,
            inline: false,
        },
        {
            name: 'facilities',
            value: `An array of objects with each object consisting of one instance of a facility.
            This object should contain two properties, \`\`rotations\`\`, and \`\`type\`\`.\n
            \`\`rotations\`\` should be an array of rotations. Each rotation is an array of strings containing the units that will be in the base at that time.\n
            \`\`type\`\` should be one of the following values: \`\`cc, factory, tp, pp, rr, hr, dorm\`\`.\n
            The facilities can be in any order you want and you can ommit facility types.\n
            Example:
            
            \`\`\`"facilities": [
                {
                    "rotations": [
                        [ Frostleaf, Vigna, FEater ],
                        [ Frostleaf, Conviction, FEater ],
                        [ Frostleaf, Conviction, Vigna ],
                        [ FEater, Conviction, Vigna ],
                        etc...
                    ],
                    "type": "factory"
                },
              ]\`\`\``,
            inline: false,
        },
    ]);
};