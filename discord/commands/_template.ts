import { SlashCommandBuilder } from '@discordjs/builders'

import config from '../../config.js'
import phrases from '../../translation.js'
import { Embed } from '../libs/embed.js'
// import { etc } from 'etc'

export default {
    name: 'Command Name',
    description: phrases.bot.commands.xp.description[config.language],
    
	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)

        .toJSON()
        return data
    },

	async execute(interaction) {
        interaction.reply('Hey!')
	}
}