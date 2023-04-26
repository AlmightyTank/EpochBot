import { SlashCommandBuilder } from '@discordjs/builders';
import phrases from '../../translation.js'
import config from '../../config.js'
import Embed from '../libs/embed.js'
import { request, gql } from 'graphql-request'
import { MessageReaction } from 'discord.js';
import fs from 'fs'

export default {
    name: 'hideout',
    description: phrases.bot.commands.hideoutInfo.description[config.language],

	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)
        .addStringOption(option => option.setName('hideout-name').setDescription('The name of the hideout').setRequired(true))

        .toJSON()
        return data
    },   
    
    async execute(interaction) {
        const HIDEOUT_FILE = 'hideout.json';
        let hideoutData = [];
        try {
            if (fs.existsSync(HIDEOUT_FILE)) {
                const data = fs.readFileSync(HIDEOUT_FILE, 'utf8');
                hideoutData = JSON.parse(data);
            } else {
                console.log(`No ${HIDEOUT_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }
    
        const hideoutName = interaction.options.getString('hideout-name').replace(/[0-9]/g, '').replace(/Lvl/g, '');
        const hideoutLvL = interaction.options.getString('hideout-name').replace(/\D/g, '');

        await interaction.deferReply();

        if (!hideoutName) {
            return interaction.editReply(phrases.bot.hideoutInfo.hideout.noitemNames[config.language]);
        }

        if (!hideoutLvL) {
            return interaction.editReply(phrases.bot.hideoutInfo.hideout.noitemLvls[config.language]);
        }
        
        const [hideoutId] = hideoutData.hideout.find(([id, name]) => {
            const nameLower = name.toLowerCase();
            const hideoutnameLower = hideoutName.toLowerCase();
            const nameKeywords = nameLower.split(/\s+/);
            const hideoutNameKeywords = hideoutnameLower.split(/\s+/);
          return hideoutNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameLower.includes(hideoutnameLower) || nameKeywords.every(keyword => hideoutNameKeywords.includes(keyword)) || hideoutnameLower.includes(nameLower);
        }) || [];
     
        if (!hideoutId) {
            return interaction.editReply(phrases.bot.hideoutInfo.hideout.noitemReqs[config.language].replace(`{hideoutName}`, hideoutName) + 1);
        }
        try {
            const query = gql`
                {
                    hideoutStations{
                        name
                        id
                        levels{
                            level
                            constructionTime
                            description
                            itemRequirements{
                                item{
                                    name
                                    lastLowPrice
                                }
                            quantity
                            }
                            stationLevelRequirements{
                                station{
                                    name
                                }
                                level
                            }
                            skillRequirements{
                                name
                                level
                            }
                            traderRequirements{
                                trader{
                                    name
                                }
                                level
                            }
                            bonuses{
                                name
                                value
                                passive
                                production
                                slotItems{
                                    name
                                }
                                skillName
                            }
                        }
                    }
                }`;
    
            const data = await request('https://api.tarkov.dev/graphql', query);
    
            const hideout = data.hideoutStations;

            //const selectedhideout = hideout.find((hideout) => hideout.item.name.includes(hideoutName));

            const selectedhideout = hideout.find((hideout) => {
                const name = hideout.name;
                const nameLower = name.toLowerCase();
                const hideoutnameLower = hideoutName.toLowerCase();
                const nameKeywords = nameLower.split(/\s+/);
                const hideoutNameKeywords = hideoutnameLower.split(/\s+/);
                return hideoutNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameLower.includes(hideoutnameLower) || nameKeywords.every(keyword => hideoutNameKeywords.includes(keyword));
            });

            //console.log(`${selectedhideout}`);

            if (!selectedhideout) {
                return interaction.editReply(phrases.bot.hideoutInfo.hideout.noitemReqs[config.language].replace(`{hideoutName}`, hideoutName) + 2);
            }

            const selectedhideoutlvl = selectedhideout.levels.find((level) => level.level.toString() === hideoutLvL);

            //console.log(`${selectedhideoutlvl}`);

            if (!selectedhideoutlvl) {
                return interaction.editReply(phrases.bot.hideoutInfo.hideout.noitemReqs[config.language].replace(`{hideoutName}`, hideoutName) + 3);
            }


            const itemRequirements = selectedhideoutlvl.itemRequirements;
            let itemRequirementsList = '';
            const numitemRequirements = itemRequirements.length;
            if (numitemRequirements > 0) {
                itemRequirementsList = `\n\n**${phrases.bot.hideoutInfo.hideout.itemRequirements[config.language]}**`;
                let totalUpgradeCost = 0;
                for (const itemReq of itemRequirements) {
                    let lastLowPrice = '';
                    if(itemReq.item.lastLowPrice === null) {
                        lastLowPrice = itemReq.quantity;
                        const itemCost = lastLowPrice;
                        totalUpgradeCost += itemCost;
                    } else {
                        lastLowPrice = itemReq.item.lastLowPrice;
                        const itemCost = lastLowPrice * itemReq.quantity;
                        totalUpgradeCost += itemCost;
                    }

                    const requiredItems = `${itemReq.quantity}x ${itemReq.item.name} (**${lastLowPrice}**)`;
                    itemRequirementsList += `${itemRequirementsList.length > 0 ? `\n• ` : ''} ${requiredItems}`;
                }
                itemRequirementsList += `\n - Total Cost: **${totalUpgradeCost}**`;
            }

            const stationLevelRequirements = selectedhideoutlvl.stationLevelRequirements;
            let stationLevelRequirementsList = '';
            const numstationLevelRequirements = stationLevelRequirements.length;
            if (numstationLevelRequirements > 0) {
                stationLevelRequirementsList = `\n\n**${phrases.bot.hideoutInfo.hideout.stationLevelRequirements[config.language]}**`;
                for (const itemReq of stationLevelRequirements) {
                    const requiredItems = `Lvl ${itemReq.level} ${itemReq.station.name}`;
                    stationLevelRequirementsList += `${stationLevelRequirementsList.length > 0 ? `\n• ` : ''} ${requiredItems}`;
                }
            }

            const skillRequirements = selectedhideoutlvl.skillRequirements;
            let skillRequirementsList = '';
            const numskillRequirements = skillRequirements.length;
            if (numskillRequirements > 0) {
                skillRequirementsList = `\n\n**${phrases.bot.hideoutInfo.hideout.skillRequirements[config.language]}**`;
                for (const itemReq of skillRequirements) {
                    const requiredItems = `Lvl ${itemReq.level} ${itemReq.name}`;
                    skillRequirementsList += `${skillRequirementsList.length > 0 ? `\n• ` : ''} ${requiredItems}`;
                }
            }

            const traderRequirements = selectedhideoutlvl.traderRequirements;
            let traderRequirementsList = '';
            const numtraderRequirements = traderRequirements.length;
            if (numtraderRequirements > 0) {
                traderRequirementsList = `\n\n**${phrases.bot.hideoutInfo.hideout.traderRequirements[config.language]}**`;
                for (const itemReq of traderRequirements) {
                    const requiredItems = `Lvl ${itemReq.level} ${itemReq.trader.name}`;
                    traderRequirementsList += `${traderRequirementsList.length > 0 ? `\n• ` : ''} ${requiredItems}`;
                }
            }

            const bonuses = selectedhideoutlvl.bonuses;
            let bonusesList = '';
            const numbonuses = bonuses.length;
            if (numbonuses > 0) {
                bonusesList = `\n\n**${phrases.bot.hideoutInfo.hideout.bonuses[config.language]}**`;
                for (const bonus of bonuses) {

                    const slotItems = bonus.slotItems.map(item => {
                        return `${item.name}`;
                    }).join(', ');

                    let requiredItems = '';
                    let bonname = '';
                    if (bonus.skillName === null) {
                        bonname = bonus.name;
                    } else {
                        bonname = `${bonus.skillName} skills`;
                    }

                    if (bonus.passive === true && slotItems === "") {
                        requiredItems = `Passive bonus to ${bonname} for ${bonus.value}`;
                    } else if (bonus.production === true && slotItems === "") {
                        requiredItems = `Production bonus to ${bonname} for ${bonus.value}`;
                    } else if (bonus.passive === true) {
                        requiredItems = `Passive bonus to ${bonname} for ${bonus.value} using ${slotItems}`;
                    } else if (bonus.production === true) {
                        requiredItems = `Production bonus to ${bonname} for ${bonus.value} using ${slotItems}`;
                    }
                    bonusesList += `${bonusesList.length > 0 ? `\n• ` : ''} ${requiredItems}`;
                }
            }

            let constTime = selectedhideoutlvl.constructionTime
            let constructionTime = '';
            if (constTime === 0) {
                constructionTime = "none.";
            } else {
                let constrTime = Math.floor(constTime/3600);
                constructionTime = `${constrTime} Hrs`
            }

            const hideoutLink = "https://escapefromtarkov.fandom.com/wiki/Hideout";

            const Embd = Embed({
                title:
                    phrases.bot.hideoutInfo.hideout.embedTitle[config.language]
                        .replace(`{hideoutname}`, selectedhideout.name)
                        .replace(`{hideoutlvl}`, selectedhideoutlvl.level),
                message:
                    phrases.bot.hideoutInfo.hideout.embedMessage[config.language]
                        .replace(`{description}`, selectedhideoutlvl.description)
                        .replace(`{conTime}`, constructionTime)
                        .replace(`{itemRequirements}`, itemRequirementsList)
                        .replace(`{stationLevelRequirements}`, stationLevelRequirementsList)
                        .replace(`{skillRequirements}`, skillRequirementsList)
                        .replace(`{traderRequirements}`, traderRequirementsList)
                        .replace(`{bonuses}`, bonusesList)
                        .replace(`{wikilink}`, hideoutLink),
                thumbnail: interaction.member.user.displayAvatarURL()
            });
                
            //await interaction.deferReply();
                
            //await sleep(5000);
                    
            interaction.editReply({ embeds: [Embd] });
            
            } catch (error) {
                console.error(error);
                interaction.editReply(phrases.bot.hideoutInfo.hideout.error[config.language]);
        }
    }
}