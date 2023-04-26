import { SlashCommandBuilder } from '@discordjs/builders'
import { client } from '../../index.js'
import momentTz from 'moment-timezone'

import Embed from '../libs/embed.js'
import phrases from '../../translation.js'
import config from '../../config.js'

export default {
    name: 'epoch',
    description: phrases.bot.commands.epoch.description[config.language],
    
	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)
        .addStringOption(option => option.setName('date').setRequired(true).setDescription(phrases.bot.commands.epoch.date[config.language]))
        .addStringOption(option => option.setName('time').setRequired(true).setDescription(phrases.bot.commands.epoch.time[config.language]))
        .addStringOption(option => option.setName('timezone').setDescription(phrases.bot.commands.epoch.timezone[config.language]))

        .toJSON();
        return data;
    },

	async execute(interaction) {

        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');
        const timezone = interaction.options.getString('timezone') || 'UTC';
    
        if (!date==null || !date=="") {

            const dateTimeStr = `${date} ${time} ${timezone}`;
            const inputTime = momentTz(dateTimeStr, 'YYYY-MM-DD HH:mm z');
            const outputTime = inputTime.add(5, 'hours');
            const epoch = outputTime.unix();
            
            const message1 = "If you want it displayed like this <t:";
            const message2 = "> use `<t:";
            const message3 = ">`";
    
            const description = `${message1}${epoch}${message2}${epoch}${message3}`;
    
            const Embd = Embed({
                title:
                    phrases.bot.epoch.timedone.embedTitle[config.language]
                        .replace(`{username}`, client.user.username),
                message:
                    phrases.bot.epoch.timedone.embedMessage[config.language]
                        .replace(`{message}`, description),
                thumbnail: interaction.member.user.displayAvatarURL()
            })
            interaction.reply({ embeds: [Embd]});

        } else {
            const dateInt = client.slash.get(dateInt.toLowerCase());

            const message4 = "Please provide a time, date, and timezone to convert";
            const message5 = "Please use /epoch YYYY-MM-DD HH:mm Timezone";

            const combined = `${message4}\n${message5}`;

            const Embd = Embed({
                title:
                    phrases.bot.epoch.timedone.embedTitle[config.language]
                        .replace(`{username}`, client.user.username),
                message:
                    phrases.bot.epoch.timedone.embedMessage[config.language]
                        .replace(`{message}`, combined),
                thumbnail: interaction.member.user.displayAvatarURL()
            })
            interaction.reply({ embeds: [Embd]});
            
        }        
    }
}