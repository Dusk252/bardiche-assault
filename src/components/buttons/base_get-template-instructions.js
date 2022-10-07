const { EmbedBuilder } = require('discord.js');

const instructionsEmbed = new EmbedBuilder()
    .setTitle('Base Template Instructions')
    .setDescription(`Template:\n\`\`\`{
        "rotationTime": [],
        "cc": [],
        "factories": [],
        "tp": [],
        "hr": [],
        "reception": [],
        "dorms": []\n}\`\`\``)
    .addFields([
        {
            name: 'rotationTime',
            value: `An array with the number of hours between your rotations.
            Rotating every 12 hours:
            
            \`\`"rotationTime": [12]\`\`
            
            Rotating once after 4 hours, then once after 16, then once after 4, and repeat:
            
            \`\`"rotationTime": [4, 16, 4]\`\``,
            inline: true,
        },
        {
            name: 'other fields',
            value: `An array of objects with each object consisting of one instance of the facility (read: if you have 3 factories, you'll have three objects in the array), and the content of the object corresponding to the set of operators .
            ex:
            
            \`\`\`factories": [
                {
                    { Frostleaf, Vigna, FEater  },
                    { Frostleaf, Conviction, FEater  },
                    { Frostleaf, Conviction, Vigna  },
                    { FEater, Conviction, Vigna  },
                    etc...
                },
                {
                    { Wild Mane, Ashlock, Fartooth  },
                    { Wild Mane, Ashlock, Fartooth  },
                    { Wild Mane, Ashlock, Fartooth  },
                    { Bubble, Vulcan, Bena  },
                    etc...
                },
            ]\`\`\``,
            inline: false,
        },
    ]);

module.exports = {
    data: {
        name: 'base_get-template-instructions',
    },
    async execute(interaction) {
        await interaction.update({ components:[], embeds: [instructionsEmbed] });
    },
};