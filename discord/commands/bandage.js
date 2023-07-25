import { SlashCommandBuilder } from '@discordjs/builders';
import puppeteer from 'puppeteer'
import config from '../../config.js';
import phrases from '../../translation.js';
import Embed from '../libs/embed.js';
import { client } from '../../index.js'


export default {
  name: 'bandage',
  description: phrases.bot.commands.bandage.description[config.language],

  register() {
    const data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)

      .toJSON();
    return data;
  },

  async execute(interaction) {
    const selectedEvent = {
      url: "https://www.escapefromtarkov.com/bandage",
      name: "Bandage",
      eval: ".count",
      eval2: ".count_left",
      completedEval: ".title > .text", // Selector for checking if the event is completed
      completedText: "Event completed", // Text to check for event completion
      message: "\nCurrent: **{current}** - Left: **{left}**",
    };
  
    await interaction.deferReply();
  
    try {
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
      });
      const page = await browser.newPage();
      await page.goto(selectedEvent.url);
  
      // Check if the event is completed
      const isEventOVER = await page.waitForSelector(selectedEvent.completedEval)
        .then(async (element) => {
          const currentText = await page.$eval(selectedEvent.completedEval, (el) => el.textContent);
          console.log("Element found:", currentText);
          return currentText == selectedEvent.completedText;
        })
        .catch((error) => {
          console.error("Error while finding the element:", error);
          return false;
        });
    

      console.log(isEventOVER);
      if (isEventOVER) {
        // If the event is completed, set the completion percentage to 100%
        const currentText = await page.$eval(selectedEvent.eval, (el) => el.textContent);
        const current = parseInt(currentText.replace(/\s+/g, ''));
        const left = 0;
        const progressBarLength = 20;
        const completedLength = progressBarLength; // Full progress bar
        const completionPercentage = 100;
  
        let currentLoc = selectedEvent.message.replace(`{current}`, current).replace(`{left}`, left);
        currentLoc += `\n\n**Progress**: [${'█'.repeat(completedLength) + '░'.repeat(progressBarLength - completedLength)}] ${completionPercentage}%`;
  
        const link = selectedEvent.url;
        currentLoc += `\n\n**Source**: ${link}`;
  
        const Embd = Embed({
          title: phrases.bot.bandage.message.embedTitle[config.language]
            .replace(`{username}`, client.user.username)
            .replace(`{name}`, selectedEvent.name),
          message: phrases.bot.bandage.message.embedMessage[config.language].replace(`{current}`, currentLoc),
          thumbnail: interaction.member.user.displayAvatarURL(),
        });
  
        await interaction.editReply({ embeds: [Embd] });
      } else {
        // If the event is not completed, proceed with normal processing
        const currentText = await page.$eval(selectedEvent.eval, (el) => el.textContent);
        const leftText = await page.$eval(selectedEvent.eval2, (el) => el.textContent);
  
        const current = parseInt(currentText.replace(/\s+/g, ''));
        const left = parseInt(leftText.replace(/\s+/g, ''));
  
        const completionPercentage = ((current / (current + left)) * 100).toFixed(2);
  
        const progressBarLength = 20;
        const completedLength = Math.floor((current / (current + left)) * progressBarLength);
  
        let currentLoc = selectedEvent.message.replace(`{current}`, current).replace(`{left}`, left);
        currentLoc += `\n\n**Progress**: [${'█'.repeat(completedLength) + '░'.repeat(progressBarLength - completedLength)}] ${completionPercentage}%`;
  
        const link = selectedEvent.url;
        currentLoc += `\n\n**Source**: ${link}`;
  
        const Embd = Embed({
          title: phrases.bot.bandage.message.embedTitle[config.language]
            .replace(`{username}`, client.user.username)
            .replace(`{name}`, selectedEvent.name),
          message: phrases.bot.bandage.message.embedMessage[config.language].replace(`{current}`, currentLoc),
          thumbnail: interaction.member.user.displayAvatarURL(),
        });
  
        await interaction.editReply({ embeds: [Embd] });
      }
  
      await browser.close();
    } catch (error) {
      console.error(error);
      interaction.editReply(phrases.bot.bandage.message.error[config.language]);
    }
  },  
};
