import fetch from 'node-fetch';
import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../../config.js';
import phrases from '../../translation.js';
import Embed from '../libs/embed.js';
import { client } from '../../index.js'

export default {
  name: 'tarkov-time',
  description: phrases.bot.commands.tarkovTime.description[config.language],

  register() {
    const data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      
      .toJSON();
    return data;
  },

  async execute(interaction) {

    await interaction.deferReply();

    try {
      const response = await fetch('https://tarkov-time.adam.id.au/api');
      const data = await response.json();
      const link = 'https://tarkov-time.adam.id.au';

      const Embd = Embed({
        title:
            phrases.bot.tarkovtime.time.embedTitle[config.language]
                .replace(`{username}`, client.user.username),
        message:
            phrases.bot.tarkovtime.time.embedMessage[config.language]
                .replace(`{left}`, data.left)
                .replace(`{right}`, data.right)
                .replace(`{link}`, link),
        thumbnail: interaction.member.user.displayAvatarURL()
      })
      interaction.editReply({ embeds: [Embd]});

    } catch (error) {
      console.error(error);
      interaction.editReply(phrases.bot.tarkovtime.time.error[config.language]);
    }
  },
};
