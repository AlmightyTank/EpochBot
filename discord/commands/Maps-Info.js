import { SlashCommandBuilder } from '@discordjs/builders';
import phrases from '../../translation.js'
import config from '../../config.js'
import Embed from '../libs/embed.js'
import { request, gql } from 'graphql-request'
import { MessageReaction } from 'discord.js';
import fs from 'fs'

export default {
    name: 'maps',
    description: phrases.bot.commands.mapsInfo.description[config.language],

	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)
        .addStringOption(option => option.setName('map-name').setDescription('The name of the map').setRequired(true))

        .toJSON()
        return data
    },
    
    async execute(interaction) {
        const MAP_FILE = 'map.json';
        let mapData = [];
        try {
            if (fs.existsSync(MAP_FILE)) {
                const data = fs.readFileSync(MAP_FILE, 'utf8');
                mapData = JSON.parse(data);
            } else {
                console.log(`No ${MAP_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }
    
        const mapName = interaction.options.getString('map-name');
        const [mapId] = mapData.map.find(([id, name]) => {
          const nameWithoutHyphens = name.replace('-', '').toLowerCase();
          const mapNameWithoutHyphens = mapName.replace('-', '').toLowerCase();
          const nameKeywords = nameWithoutHyphens.split(/\s+/);
          const mapNameKeywords = mapNameWithoutHyphens.split(/\s+/);
          return mapNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameWithoutHyphens.includes(mapNameWithoutHyphens);
        }) || [];

        await interaction.deferReply();
     

        if (!mapId) {
            return interaction.editReply(phrases.bot.mapsInfo.map.noMap[config.language].replace(`{mapName}`, mapName) + 1);
        }
        try {
            const query = gql`
            {
                maps{
                    name
                    description
                    enemies
                    players
                    raidDuration
                    wiki
                    bosses{
                        boss{
                            name
                            health{
                                max
                                bodyPart
                            }
                            imagePortraitLink
                        }
                        escorts{
                            boss{
                                name
                                health{
                                    max
                                    bodyPart
                                }
                            }
                            amount{
                                count
                                chance
                            }
                        }
                        spawnChance
                        spawnTrigger
                        spawnLocations{
                            name
                            chance
                        }
                    }
                }
            }`;
    
            const data = await request('https://api.tarkov.dev/graphql', query);
    
            const map = data.maps;

            const selectedmap = map.find((maps) => {
                const name = maps.name;
                const nameLower = name.toLowerCase();
                const mapsnameLower = mapName.toLowerCase();
                const nameKeywords = nameLower.split(/\s+/);
                const mapsnameKeywords = mapsnameLower.split(/\s+/);
                return mapsnameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameLower.includes(mapsnameLower) || nameKeywords.every(keyword => mapsnameKeywords.includes(keyword));
            });

            if (!selectedmap) {
                return interaction.editReply(phrases.bot.mapsInfo.map.noMap[config.language].replace(`{mapName}`, mapName) + 2);
            }

            // Parse the bosses data into a JavaScript object
            const bosses = selectedmap.bosses;
            
            // Find the total health pool of each enemy and store it in an array
            const enemyHealthPools = [];
            const followHealthPools = [];
            const spawnLocationsPools = [];
            for (let j = 0; j < bosses.length; j++) {
                const boss = bosses[j];
                const bossName = boss.boss.name;
                const health = boss.boss.health;
                const spawnLocations = boss.spawnLocations;
                const spawnTrigger = boss.spawnTrigger;
                const spawnChance = boss.spawnChance;
                for (let d = 0; d < spawnLocations.length; d++) {
                    const spawnLocationsName = spawnLocations[d].name;
                    const spawnLocationsChance = spawnLocations[d].chance;
                    spawnLocationsPools.push({ name: spawnLocationsName, chance: spawnLocationsChance, bossname: bossName, trigger: spawnTrigger});
                }
                let totalHealth = 0;
                let followCount = 0;
                for (let d = 0; d < boss.escorts.length; d++) {
                    const escort = boss.escorts[d];
                    const followName = escort.boss.name;
                    const followHealth = escort.boss.health;
                    let followTotalHealth = 0;
                    for (let c = 0; c < followHealth.length; c++) {
                        followTotalHealth += followHealth[c].max;
                    }
                    followHealthPools.push({ name: followName, health: followTotalHealth, bossname: bossName });
                    if (escort.amount[0].chance > 0) {
                        followCount += escort.amount[0].count;
                    }
                }
                for (let c = 0; c < health.length; c++) {
                    totalHealth += health[c].max;
                }
                enemyHealthPools.push({ name: bossName, health: totalHealth, follower: followCount, chance: spawnChance });
            }

            let bossList = '';
            let counter = 0;
            let addedBosses = []; // keep track of bosses that have already been added
            enemyHealthPools.forEach(bossName => {
                const matchingEnemies = enemyHealthPools.filter(enemy => enemy.name === bossName.name);
                if (matchingEnemies) {
                    matchingEnemies.forEach(enemy => {
                        if (!addedBosses.includes(bossName.name)) {
                            let addedFollowers = [];
                            bossList += `\n**Boss**:`;
                            if (enemy.health > 0) {
                                const followWord = enemy.follower === 1 ? "follower" : "followers";
                                bossList += ` ${enemy.name}\n${enemy.health} health : ${Math.floor(enemy.chance * 100)}% Spawn Chance : ${enemy.follower} ${followWord}\n`;
                                if (enemy.follower > 0) {
                                    const matchingEnemies = followHealthPools.filter(enemy => enemy.bossname === bossName.name);
                                    if (matchingEnemies) {
                                        bossList += `**Followers**:\n`;
                                        matchingEnemies.forEach(escorts => {
                                            if (!addedFollowers.includes(escorts.name)) {
                                                if (escorts.health > 0) {
                                                    bossList += `‎      • ${escorts.name}: ${escorts.health} health\n`;
                                                } else {
                                                    bossList += `‎      • ${escorts.name}\n`;
                                                }
                                                addedFollowers.push(escorts.name);
                                            }
                                        });
                                    }
                                }
                                const matchingEnemies = spawnLocationsPools.filter(enemy => enemy.bossname === bossName.name);
                                if (matchingEnemies) {
                                    bossList += `**Spawn Locations**:\n`;
                                    let uniqueSpawns = [];
                                    
                                    matchingEnemies.forEach(spawns => {
                                      if (spawns.trigger === null) {
                                        if (spawns.chance === 1) {
                                          if (!uniqueSpawns.includes(spawns.name)) {
                                            bossList += `‎      • ${spawns.bossname} spawns at ${spawns.name}\n`;
                                            uniqueSpawns.push(spawns.name);
                                          }
                                        } else {
                                          if (!uniqueSpawns.includes(spawns.name)) {
                                            bossList += `‎      • ${spawns.bossname} has ${Math.floor(spawns.chance * 100)}% chance of spawning at ${spawns.name}\n`;
                                            uniqueSpawns.push(spawns.name);
                                          }
                                        }
                                      } else {
                                        if (spawns.chance === 1) {
                                          if (!uniqueSpawns.includes(spawns.name + spawns.trigger)) {
                                            bossList += `‎      • ${spawns.bossname} spawns at ${spawns.name} on ${spawns.trigger}\n`;
                                            uniqueSpawns.push(spawns.name + spawns.trigger);
                                          }
                                        } else {
                                          if (!uniqueSpawns.includes(spawns.name + spawns.trigger)) {
                                            bossList += `‎      • ${spawns.bossname} has ${Math.floor(spawns.chance * 100)}% chance of spawning at ${spawns.name} on ${spawns.trigger}\n`;
                                            uniqueSpawns.push(spawns.name + spawns.trigger);
                                          }
                                        }
                                      }
                                    });
                                }
                            } else {
                                const followWord = enemy.follower === 1 ? "follower" : "followers";
                                bossList += ` ${enemy.name}\n${Math.floor(enemy.chance * 100)}% Spawn Chance : ${enemy.follower} ${followWord}\n`;
                                if (enemy.follower > 0) {
                                    const matchingEnemies = followHealthPools.filter(enemy => enemy.bossname === bossName.name);
                                    if (matchingEnemies) {
                                        bossList += `**Followers**:\n`;
                                        matchingEnemies.forEach(escorts => {
                                            if (!addedFollowers.includes(escorts.name)) {
                                                if (escorts.health > 0) {
                                                    bossList += `‎      • ${escorts.name}: ${escorts.health} health\n`;
                                                } else {
                                                    bossList += `‎      • ${escorts.name}\n`;
                                                }
                                                addedFollowers.push(escorts.name);
                                            }
                                        });
                                    }
                                }
                                const matchingEnemies = spawnLocationsPools.filter(enemy => enemy.bossname === bossName.name);
                                if (matchingEnemies) {
                                    bossList += `**Spawn Locations**:\n`;
                                    let uniqueSpawns = [];
                                    
                                    matchingEnemies.forEach(spawns => {
                                      if (spawns.trigger === null) {
                                        if (spawns.chance === 1) {
                                          if (!uniqueSpawns.includes(spawns.name)) {
                                            bossList += `‎      • ${spawns.bossname} spawns at ${spawns.name}\n`;
                                            uniqueSpawns.push(spawns.name);
                                          }
                                        } else {
                                          if (!uniqueSpawns.includes(spawns.name)) {
                                            bossList += `‎      • ${spawns.bossname} has ${Math.floor(spawns.chance * 100)}% chance of spawning at ${spawns.name}\n`;
                                            uniqueSpawns.push(spawns.name);
                                          }
                                        }
                                      } else {
                                        if (spawns.chance === 1) {
                                          if (!uniqueSpawns.includes(spawns.name + spawns.trigger)) {
                                            bossList += `‎      • ${spawns.bossname} spawns at ${spawns.name} on ${spawns.trigger}\n`;
                                            uniqueSpawns.push(spawns.name + spawns.trigger);
                                          }
                                        } else {
                                          if (!uniqueSpawns.includes(spawns.name + spawns.trigger)) {
                                            bossList += `‎      • ${spawns.bossname} has ${Math.floor(spawns.chance * 100)}% chance of spawning at ${spawns.name} on ${spawns.trigger}\n`;
                                            uniqueSpawns.push(spawns.name + spawns.trigger);
                                          }
                                        }
                                      }
                                    });
                                }
                            }
                            addedBosses.push(bossName.name); // add boss to the list of added bosses
                            //console.log(addedBosses);
                            counter++;
                        }
                    });
                }
            });
            
            const Embd = Embed({
                title:
                    phrases.bot.mapsInfo.map.embedTitle[config.language]
                        .replace(`{mapname}`, selectedmap.name),
                message:
                    phrases.bot.mapsInfo.map.embedMessage[config.language]
                        .replace(`{description}`, selectedmap.description || 'none.')
                        .replace(`{players}`, selectedmap.players || 'none.')
                        .replace(`{raidtime}`, selectedmap.raidDuration || 'none.')
                        .replace(`{enemy}`, bossList || 'none.')
                        .replace(`{wikilink}`, selectedmap.wiki),
                    thumbnail: selectedmap.bosses[0].boss.imagePortraitLink
                });

                interaction.editReply({ embeds: [Embd] });
            
            } catch (error) {
                console.error(error);
                interaction.editReply(phrases.bot.mapsInfo.map.error[config.language]);
        }
    }
}