import { SlashCommandBuilder } from '@discordjs/builders';
import phrases from '../../translation.js'
import config from '../../config.js'
import Embed from '../libs/embed.js'
import { request, gql } from 'graphql-request'
import { MessageReaction } from 'discord.js';
import fs from 'fs'

export default {
    name: 'task',
    description: phrases.bot.commands.questInfo.description[config.language],

	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)
        .addStringOption(option => option.setName('task-name').setDescription('The name of the task').setRequired(true))

        .toJSON()
        return data
    },   
    
    async execute(interaction) {
        const TASK_FILE = './data/tasks.json';
        let taskData = [];
        try {
            if (fs.existsSync(TASK_FILE)) {
                const data = fs.readFileSync(TASK_FILE, 'utf8');
                taskData = JSON.parse(data);
            } else {
                console.log(`No ${TASK_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }
    
        const taskName = interaction.options.getString('task-name');
        const [taskId] = taskData.quest.find(([id, name]) => {
          const nameWithoutHyphens = name.replace('-', '').toLowerCase();
          const taskNameWithoutHyphens = taskName.replace('-', '').toLowerCase();
          const nameKeywords = nameWithoutHyphens.split(/\s+/);
          const taskNameKeywords = taskNameWithoutHyphens.split(/\s+/);
          return taskNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameWithoutHyphens.includes(taskNameWithoutHyphens);
        }) || [];

        await interaction.deferReply();
     

        if (!taskId) {
            return interaction.editReply(phrases.bot.questInfo.task.noTask[config.language].replace(`{taskName}`, taskName));
        }
        try {
            const query = gql`
                {
                    task(id: "${taskId}") {
                        id
                        name
                        map {
                            name
                        }
                        neededKeys{
                            keys {
                                id
                            }
                        }
                        wikiLink
                        trader{
                            name
                            imageLink
                        }
                        kappaRequired
                        lightkeeperRequired
                        minPlayerLevel
                        objectives {
                            description
                        }
                        taskRequirements{
                            task {
                                id
                                name
                            }
                        }
                    }
                }`;
    
            const data = await request('https://api.tarkov.dev/graphql', query);
    
            const task = data.task;
    
            let mapName = task.map ? task.map.name : null;
    
            if (mapName === null) {
                mapName = phrases.bot.questInfo.task.noMap[config.language];
            } else {
                mapName = JSON.stringify(task.map.name).replace(/\"/g,"");
            }
    
            let keys = task.neededKeys;
    
            if (keys && keys.length) {
                const keyIds = keys.map(key => key.keys[0].id);
                const keyNames = [];
    
                // Fetch the in-game name of each key using a GraphQL request
                for (const keyId of keyIds) {
                    const keyQuery = gql`
                        {
                            item(id: "${keyId}") {
                                name
                            }
                        }
                    `;
                    const keyData = await request('https://api.tarkov.dev/graphql', keyQuery);
                    const keyName = keyData.item ? keyData.item.name : null;
                    if (keyName) {
                        keyNames.push(keyName);
                    }
                }
    
                keys = keyNames.join(', ');
            } else {
                keys = phrases.bot.questInfo.task.noKeys[config.language];
            }
    
            let descriptionList = '';
    
            for (let i = 0; i < task.objectives.length; i++) {
                descriptionList += `${i + 1}. ${task.objectives[i].description}\n`;
            }
    
            let requirementsList = '';
    
            if (task.taskRequirements.length > 0) {
                const requiredTaskNames = task.taskRequirements.map(req => req.task.name);
                requirementsList = requiredTaskNames.join(', ');
            } else {
                requirementsList = phrases.bot.questInfo.task.noRequirements[config.language];
            }
    
            const Embd = Embed({
                title:
                    phrases.bot.questInfo.task.embedTitle[config.language]
                        .replace(`{taskname}`, task.name),
                message:
                    phrases.bot.questInfo.task.embedMessage[config.language]
                        .replace(`{mapname}`, mapName)
                        .replace(`{obj}`, descriptionList || 'none.')
                        .replace(`{tradername}`, task.trader.name)
                        .replace(`{wikilink}`, task.wikiLink)
                        .replace(`{kappareq}`, task.kappaRequired)
                        .replace(`{keeperReq}`, task.lightkeeperRequired)
                        .replace(`{minplayerlvl}`, task.minPlayerLevel)
                        .replace(`{needkeys}`, keys)
                        .replace(`{taskRequirements}`, requirementsList),
                    thumbnail: task.trader.imageLink
                });
                               
                //await sleep(5000);
                    
                interaction.editReply({ embeds: [Embd] });
            
            } catch (error) {
                console.error(error);
                interaction.editReply(phrases.bot.questInfo.task.error[config.language]);
        }
    }
}