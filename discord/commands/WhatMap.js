import { SlashCommandBuilder } from '@discordjs/builders'
import { client } from '../../index.js'

import Embed from '../libs/embed.js'
import phrases from '../../translation.js'
import config from '../../config.js'

import fs from 'fs'

export default {
    name: 'whatmap',
    description: phrases.bot.commands.whatmap.description[config.language],
    
	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)
        .addStringOption(option => option.setName('command').setRequired(true).setDescription(phrases.bot.commands.whatmap.command[config.language]))
        .addStringOption(option => option.setName('map').setDescription(phrases.bot.commands.whatmap.map[config.language]))

        .toJSON();
        return data;
    },

	async execute(interaction) {

        const command = interaction.options.getString('command');

        const args = interaction.options.getString('map');

        const MAPS_FILE = './data/maps.json';
        let maps = [];
        try {
            if (fs.existsSync(MAPS_FILE)) {
            const data = fs.readFileSync(MAPS_FILE, 'utf8');
            maps = JSON.parse(data);
            } else {
            console.log(`No ${MAPS_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }

        const approvedMaps = ['customs', 'reserve', 'lighthouse', 'shoreline', 'labs', 'streets', 'woods', 'factory', 'interchange']; // List of approved maps

        if (command === 'addmap' || command === 'am' || command === 'add') {
      
            const mapToAdd = args.toLowerCase().trim();
        
            if (!mapToAdd.length) {
                interaction.reply({content: 'The number of maps must be at least one.', ephemeral: true });
                return;
            }

            if (!approvedMaps.includes(mapToAdd)) {
                interaction.reply({content: 'The map you are trying to add is not approved.', ephemeral: true});
                return;
            }
            
            const map = mapToAdd;

            maps.lists.push({
                map,
            });
        
            fs.writeFile(MAPS_FILE, JSON.stringify(maps), (err) => {
                if (err) {
                    console.error(err);
                        interaction.reply({content: 'An error occurred while writing to the maps.json file.', ephemeral: true });
                } else {
                    interaction.reply({content: 'The new map was successfully added!', ephemeral: true });
                }
            });

        } else if (command === 'removemap' || command === 'rm' || command === 'remove') {
            
            const mapToRemove = args.toLowerCase().trim();

            if (!mapToRemove.length) {
                interaction.reply({content: 'Please provide a map to remove.', ephemeral: true });
                return;
            }

            const indexToRemove = maps.lists.findIndex((lists) => lists.map === mapToRemove);
            
            if (indexToRemove === -1) {
                interaction.reply({content: 'The map to remove was not found.', ephemeral: true });
                return;
            }
            
            maps.lists.splice(indexToRemove, 1);
            
            fs.writeFile(MAPS_FILE, JSON.stringify(maps), (err) => {
                if (err) {
                    console.error(err);
                    interaction.reply({content: 'An error occurred while writing to the maps.json file.', ephemeral: true });
                } else {
                    interaction.reply({content: 'The map was successfully removed!', ephemeral: true });
                }
            });
            
        } else if (command === 'randommap' || command === 'ram'|| command === 'r') {

            const selectedMaps = [];

            if (selectedMaps.length === maps.lists.length) {
                selectedMaps = [];
            }

            let randomMap = null;
            do {
                randomMap = maps.lists[Math.floor(Math.random() * maps.lists.length)].map;
            } while (selectedMaps.includes(randomMap));

            selectedMaps.push(randomMap);
    
            const Embd = Embed({
                title:
                    phrases.bot.whatmap.map.embedTitle[config.language]
                        .replace(`{username}`, client.user.username),
                message:
                    phrases.bot.whatmap.map.embedMessage[config.language]
                        .replace(`{map}`, randomMap),
                thumbnail: interaction.member.user.displayAvatarURL()
            })
            interaction.reply({ embeds: [Embd]});

        } else if (command === 'listmaps' || command === 'lm' || command === 'list') {

            const mapList = maps.lists.map(m => m.map).join('\n');
            interaction.reply({content: `The current maps are:\n${mapList}`, ephemeral: true });
    
        } else {
            interaction.reply({content: 'Invalid command.', ephemeral: true });
        }
	}
}