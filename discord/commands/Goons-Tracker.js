import { SlashCommandBuilder } from '@discordjs/builders';
import puppeteer from 'puppeteer'
import config from '../../config.js';
import phrases from '../../translation.js';
import Embed from '../libs/embed.js';
import { client } from '../../index.js'



export default {
  name: 'goons-tracker',
  description: phrases.bot.commands.goonsTracker.description[config.language],

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
      let currentLoc = "";
        (async () => {
          const browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium-browser'
          });
          const page = await browser.newPage();
          await page.goto('https://www.goontracker.com');
          const currentLocation = await page.$eval('h5:nth-of-type(1)', el => el.textContent);
          currentLoc += `Current Location: **${currentLocation.replace('Current Location : ', '')}**`;
          const lastReported = await page.$eval('h5:nth-of-type(2)', el => el.textContent);

          const dateString = `${lastReported.replace('Last Reported: ', '')}`;

          const [date, time] = dateString.split('   ');
          const [day, month, year] = date.split('/');
          const [hour, minute, second] = time.split(':');
          
          // Create a Date object with the specified date and time components
          const datetime = new Date(year, month - 1, day, hour, minute, second);
          
          // Format the date and time string with the desired options
          const formattedDatetime = datetime.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'America/Chicago' // Replace with your desired time zone
          });

          const [formatteddate, formattedtime] = formattedDatetime.split(', ');

          const finalFormat = `${formattedtime} - ${formatteddate}`;

          currentLoc += `\nLast Reported: **${finalFormat}**`;
          const link = 'https://www.goontracker.com';
          currentLoc += `\n\n**Source**: ${link}`;

          const Embd = Embed({
            title:
                phrases.bot.goonsTracker.current.embedTitle[config.language]
                    .replace(`{username}`, client.user.username),
            message:
                phrases.bot.goonsTracker.current.embedMessage[config.language]
                    .replace(`{current}`, currentLoc),
            thumbnail: interaction.member.user.displayAvatarURL()
          })
          interaction.editReply({ embeds: [Embd]});
          
          await browser.close();
        })();

    } catch (error) {
      console.error(error);
      interaction.editReply(phrases.bot.goonsTracker.current.error[config.language]);
    }
  },
};
