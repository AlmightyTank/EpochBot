import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from '../../index.js';

import Embed from '../libs/embed.js';
import phrases from '../../translation.js';
import config from '../../config.js';

import path from 'path';
import fs from 'fs';

export default {
  name: 'reload',
  description: 'Reloads all command files',

  register() {
    const data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName('command')
          .setDescription('The command to reload.')
          .setRequired(true)
      )
      .toJSON();
    return data;
  },

  async execute(interaction) {
    if (interaction.user.id !== '613545019663712261') {
      return interaction.reply('Only the bot owner can execute this command.');
    }
    const commandName = interaction.options.getString('command', true).toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply(`There is no command with name \`${commandName}\`!`);
    }

    console.log(command);

    try {
      interaction.client.commands.delete(command.name);
      const modulePath = `./${command.name}.js`;
      const { default: newCommand } = await import(modulePath);
      interaction.client.commands.set(newCommand.name, newCommand);
      await interaction.reply(`Command \`${newCommand.name}\` was reloaded!`);
    } catch (error) {
      console.error(error);
      await interaction.reply(
        `There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``
      );
    }
  },
};
