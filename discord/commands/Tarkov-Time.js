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
      .addStringOption(option =>
        option.setName('desired_time')
          .setDescription('Specify the desired time')
          .setRequired(false))
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
        thumbnail: interaction.member.user.displayAvatarURL(),
      });
  
      const desiredTime = interaction.options.getString('desired_time');
      if (desiredTime) {
        const [desiredHours, desiredMinutes, desiredSeconds = '00'] = desiredTime.split(':');
        const leftHours = parseInt(data.left.split(':')[0], 10);
        const leftMinutes = parseInt(data.left.split(':')[1], 10);
        const leftSeconds = parseInt(data.left.split(':')[2], 10) || 0;
        const rightHours = parseInt(data.right.split(':')[0], 10);
        const rightMinutes = parseInt(data.right.split(':')[1], 10);
        const rightSeconds = parseInt(data.right.split(':')[2], 10) || 0;
  
        const leftTimeDiff = Math.abs(
          (desiredHours - leftHours) * 60 + (desiredMinutes - leftMinutes)
        );
        const rightTimeDiff = Math.abs(
          (desiredHours - rightHours) * 60 + (desiredMinutes - rightMinutes)
        );
  
        let closestTime, closestTimeDiff, closestTimeLabel;
        if (leftTimeDiff < rightTimeDiff) {
          closestTime = data.left;
          closestTimeLabel = 'Left';
          closestTimeDiff = leftTimeDiff;
        } else {
          closestTime = data.right;
          closestTimeLabel = 'Right';
          closestTimeDiff = rightTimeDiff;
        }
  
        const waitingDuration = closestTimeDiff * 7; // Calculate waiting duration in seconds

        const seconds = waitingDuration % 60;
        const minutes = Math.floor((waitingDuration / 60) % 60);
        const hours = Math.floor(waitingDuration / 3600); // Assuming 3600 seconds per hour

  
        Embd.addField('Desired Time', desiredTime, true);
        Embd.addField('Closest Time', closestTimeLabel, true);

        let durationString = '';
        if (hours > 0) {
          durationString += `${hours} hour${hours > 1 ? 's' : ''}, `;
        }
        if (minutes > 0) {
          durationString += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
        }
        durationString += `${seconds} second${seconds !== 1 ? 's' : ''}`;

        if (minutes > 20) {
          Embd.addField('Wait Time EST \`(+ 3-7 minutes)\`', durationString, true);
        } else {
          Embd.addField('Wait Time EST', durationString, true);
        }
        
      }
  
      interaction.editReply({ embeds: [Embd] });
    } catch (error) {
      console.error(error);
      interaction.editReply(phrases.bot.tarkovtime.time.error[config.language]);
    }
  },   
};
