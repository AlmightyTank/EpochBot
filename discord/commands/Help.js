import { SlashCommandBuilder } from '@discordjs/builders'
import { client } from '../../index.js'

import Embed from '../libs/embed.js'
import phrases from '../../translation.js'
import config from '../../config.js'

export default {
    name: 'help',
    description: phrases.bot.commands.help.description[config.language],
    
	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)

        .toJSON();
        return data;
    },

	async execute(interaction) {
        /*
        let embed = new MessageEmbed()
        .setColor(process.env.COLOR)
        .setTitle(`**[❄️☀️] - Help Center - [☀️❄️]**`)
        .setDescription(`
            **__Commands__**

            ${
                client.commands.map(p => {
                    return `**${p.name}** - ${typeof p.values != "undefined" ? `[` + p.values.join(", ") + `]` : ""} (${p.description})\n`
                }).join("")
            }

            **__Useful Links__**

            **Support Server** -> **[[Click Here!]](https://discord.gg/8ZqctVY)**
            **Official Website** -> **[[Click Here!]](${process.env.WEBSITE})**
            **Invite Me** -> **[[Click Here!]](${InviteLink})**

            **__Note__**

            **If The Bot Is Not Working, Check If The Bot Has The Following Permissions: \`SPEAK\`, \`CONNECT\`.**
            **If You Encounter Another Problem, You Are More Than Welcome To Report This At Our Support Server.**

            **__Credits__**

            **Roei** [\`Roei#9999\`] -> Owner.
            **Benouiry** [\`Benouiry#0074\`] -> Owner.
            **ShiNxz** [\`ShiNxz#0001\`] -> Bot & Website Developer.
            `)
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({text: `AC Service, 2020 ©️`})
        .setURL(`https://${process.env.WEBSITE}`)
        .setTimestamp();
        */

        const embed = Embed({
            message: `**__${phrases.bot.commands.help.commands[config.language]}__**
            ${
                client.commands.map(p => {
                    return `**/${p.name}** - ${typeof p.values != "undefined" ? `[` + p.values.join(", ") + `]` : ""} ${p.description}\n`
                }).join("")
            }`
        })
        
        interaction.reply({ embeds: [embed] });
	}
}