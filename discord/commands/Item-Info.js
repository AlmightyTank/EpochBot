import { SlashCommandBuilder } from '@discordjs/builders';
import phrases from '../../translation.js'
import config from '../../config.js'
import Embed from '../libs/embed.js'
import { request, gql } from 'graphql-request'
import { MessageReaction } from 'discord.js';
import fs from 'fs'

export default {
    name: 'item',
    description: phrases.bot.commands.itemInfo.description[config.language],

	register() {
        const data = new SlashCommandBuilder()
		    .setName(this.name)
		    .setDescription(this.description)
        .addStringOption(option => option.setName('item-name').setDescription('The name of the item').setRequired(true))
        .addStringOption(option => option.setName('crabat').setDescription('craftfor, craftusing, bartersfor, bartersusing').setRequired(false))

        .toJSON()
        return data
    },   
    
    async execute(interaction) {
        const ITEM_FILE = './data/items.json';
        let itemData = [];
        try {
            if (fs.existsSync(ITEM_FILE)) {
                const data = fs.readFileSync(ITEM_FILE, 'utf8');
                itemData = JSON.parse(data);
            } else {
                console.log(`No ${ITEM_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }
    
        const itemName = interaction.options.getString('item-name');
        const extra = interaction.options.getString('crabat');
        const matchingItems = itemData.items.filter(([id, name, shortname]) => {
          const shortnameWithoutHyphens = shortname.replace('-', '').toLowerCase();
          const itemshortnameWithoutHyphens = itemName.replace('-', '').toLowerCase();
          const shortnameKeywords = shortnameWithoutHyphens.split(/\s+/);
          const itemshortnameKeywords = itemshortnameWithoutHyphens.split(/\s+/);
        
          const nameWithoutHyphens = name.replace('-', '').toLowerCase();
          const itemNameWithoutHyphens = itemName.replace('-', '').toLowerCase();
          const nameKeywords = nameWithoutHyphens.split(/\s+/);
          const itemNameKeywords = itemNameWithoutHyphens.split(/\s+/);
          return itemNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameWithoutHyphens.includes(itemNameWithoutHyphens) || itemshortnameKeywords.every(keyword => shortnameKeywords.includes(keyword)) || shortnameKeywords.every(keyword => keyword === itemshortnameWithoutHyphens);
        });
        
        const [itemId] = matchingItems[0] || [];        

        await interaction.deferReply();
     
        if (extra == null || extra == '') {
            if (!itemId) {
              return interaction.editReply(phrases.bot.itemInfo.item.notFinditem[config.language].replace(`{obj}`, itemName));
          }
          try {
              const query = gql`
              {
                  item(id: "${itemId}") {
                    normalizedName
                    name
                    description
                    iconLink
                    wikiLink
                    basePrice
                    sellFor{
                      vendor{
                        name
                      }
                      price
                      currency
                    }
                    lastLowPrice
                    low24hPrice
                    high24hPrice
                    changeLast48h
                    changeLast48hPercent
                    usedInTasks {
                      name
                    }
                    receivedFromTasks{
                      name
                    }
                }
            }`;
      
              const data = await request('https://api.tarkov.dev/graphql', query);
      
              const item = data.item;

              let taskList = '';
              const numTasks = item.usedInTasks.length;
              if (numTasks > 0) {
                const taskNames = [...new Set(item.usedInTasks.map(task => task.name))];
                const taskWord = numTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskList = `${numTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              let taskreList = '';
              const numreTasks = item.receivedFromTasks.length;
              if (numreTasks > 0) {
                const taskNames = [...new Set(item.receivedFromTasks.map(task => task.name))];
                const taskWord = numreTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskreList = `${numreTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              const percentChange = item.changeLast48hPercent;
              const changeEmoji = percentChange > 0 ? '📈' : '📉';
              const percentString = `${Math.abs(percentChange)}% ${changeEmoji}`;

              const vendors = item.sellFor;
              const vendorPrices = [];
              vendors.forEach((vendor) => {
                  if (vendor && vendor.vendor.name !== "Flea Market" && vendor.vendor.name !== "Fence") {
                      vendorPrices.push(`${vendor.vendor.name}: **${vendor.price} ${vendor.currency}**`);
                  }
              });
              let vendorPriceString = vendorPrices.join(', ');
  
              if (vendors.length < 1 || vendors === "[]") {
                  vendorPriceString = "Not bought by Traders."
              }

              const strings = ["cf", "bf", "cu", "bu"];
              const messages = {
                cf: phrases.bot.itemInfo.item.suggestioncf[config.language],
                bf: phrases.bot.itemInfo.item.suggestionbf[config.language],
                cu: phrases.bot.itemInfo.item.suggestioncu[config.language],
                bu: phrases.bot.itemInfo.item.suggestionbu[config.language],
              };
              const randomIndex = Math.floor(Math.random() * strings.length);
              const randomString = strings[randomIndex];
              const randomMessage = messages[randomString];

              const message = phrases.bot.itemInfo.item.messagesugg[config.language].replace(`{randomMessage}`, randomMessage).replace(`{itemName}`, itemName).replace(`{randomString}`, randomString);
      
              const Embd = Embed({
                  title:
                      phrases.bot.itemInfo.item.embedTitle[config.language]
                          .replace(`{itemname}`, item.name),
                  message:
                      phrases.bot.itemInfo.item.embedMessage[config.language]
                          .replace(`{obj}`, item.description || 'none.')
                          .replace(`{baseprice}`, item.basePrice)
                          .replace(`{lowprice}`, item.lastLowPrice || 'not sold on Flea.')
                          .replace(`{low24h}`, item.low24hPrice || 'not sold on Flea.')
                          .replace(`{high24h}`, item.high24hPrice || 'not sold on Flea.')
                          .replace(`{last48h}`, item.changeLast48h || 'none.')
                          .replace(`{last48hP}`, percentString)
                          .replace(`{usedintask}`, taskList || 'none.')
                          .replace(`{receivedFromTasks}`, taskreList || 'none.')
                          .replace(`{last48hP}`, percentString)
                          .replace(`{crabat}`, message)
                          .replace(`{vendorPrices}`, vendorPriceString)
                          .replace(`{wikilink}`, item.wikiLink),
                      thumbnail: item.iconLink
                  });
                      
                  interaction.editReply({ embeds: [Embd] });
              
              } catch (error) {
                  console.error(error);
                  interaction.editReply(phrases.bot.itemInfo.item.fetchingitem[config.language]);
          }
        } else if (extra === 'craftfor' || extra === 'cf') {
          if (!itemId) {
            return interaction.editReply(phrases.bot.itemInfo.item.notFinditem[config.language].replace(`{obj}`, itemName));
          }
          try {
              const query = gql`
              {
                item(id: "${itemId}") {
                  normalizedName
                  name
                  description
                  iconLink
                  wikiLink
                  basePrice
                  sellFor{
                    vendor{
                      name
                    }
                    price
                    currency
                  }
                  lastLowPrice
                  low24hPrice
                  high24hPrice
                  changeLast48h
                  changeLast48hPercent
                  usedInTasks {
                    name
                  }
                  receivedFromTasks{
                    name
                  }
                  craftsFor{
                    level
                    station{
                      name
                    }
                    requiredItems{
                      item{
                        id
                        name
                        lastLowPrice
                        basePrice
                        sellFor{
                          price
                          currency
                        }
                      }
                      quantity
                    }
                    rewardItems{
                      item{
                        id
                        name
                        lastLowPrice
                        basePrice
                        sellFor{
                          price
                          currency
                        }
                      }
                      quantity
                    }
                    taskUnlock{
                      name
                    }
                  }
              }
          }`;
      
              const data = await request('https://api.tarkov.dev/graphql', query);
      
              const item = data.item;

              let taskList = '';
              const numTasks = item.usedInTasks.length;
              if (numTasks > 0) {
                const taskNames = [...new Set(item.usedInTasks.map(task => task.name))];
                const taskWord = numTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskList = `${numTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              let taskreList = '';
              const numreTasks = item.receivedFromTasks.length;
              if (numreTasks > 0) {
                const taskNames = [...new Set(item.receivedFromTasks.map(task => task.name))];
                const taskWord = numreTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskreList = `${numreTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              const percentChange = item.changeLast48hPercent;
              const changeEmoji = percentChange > 0 ? '📈' : '📉';
              const percentString = `${Math.abs(percentChange)}% ${changeEmoji}`;

              const vendors = item.sellFor;
              const vendorPrices = [];
              vendors.forEach((vendor) => {
                  if (vendor && vendor.vendor.name !== "Flea Market" && vendor.vendor.name !== "Fence") {
                      vendorPrices.push(`${vendor.vendor.name}: **${vendor.price} ${vendor.currency}**`);
                  }
              });
              let vendorPriceString = vendorPrices.join(', ');
  
              if (vendors.length < 1 || vendors === "[]") {
                  vendorPriceString = "Not bought by Traders."
              }

              const craftsFor = item.craftsFor;
              let craftForList = '';
              const numCraftsFor = craftsFor.length;
              if (numCraftsFor > 0) {
                  craftForList = `\n**${phrases.bot.itemInfo.item.craftsFor[config.language]}**`;
                for (const craft of craftsFor) {

                  const requiredItems = craft.requiredItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}/${Math.floor(item.quantity * price)}**)`;
                  }).join(', ');

                  const rewardItems = craft.rewardItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}**)`;
                  }).join(', ');

                  const requiredCosts = craft.requiredItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const rewardCosts = craft.rewardItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const unitCosts = craft.rewardItems.reduce((accumulator, item) => {
                    return accumulator + (rewardCosts / item.quantity);
                  }, 0);

                  const profit = (rewardCosts - requiredCosts);

                  let taskUnlock = "";
                  const taskUnlocks = craft.taskUnlock;
                  if (taskUnlocks === null) {
                    taskUnlock = "";
                  } else {
                    taskUnlock = ` - Task Required: **${taskUnlocks.name}**`;
                  }

                  const totalCosts = craft.rewardItems.reduce((accumulator, item) => {
                    let totalCost = "";
                    if (item.quantity > 1) {
                      totalCost = `Total P/C/UC: **${profit}/${requiredCosts}/${unitCosts}**`;
                    } else {
                      totalCost = `Total P/C: **${profit}/${requiredCosts}**`;
                    }

                    return accumulator + (totalCost);
                  }, "");

                  craftForList += `${craftForList.length > 0 ? `\n• ${craft.station.name} ${craft.level} ` : ''}- ${requiredItems} => ${rewardItems} - ${totalCosts}${taskUnlock}`;
                }
              } else {
                interaction.editReply(phrases.bot.itemInfo.item.noCrafts[config.language].replace(`{itemName}`, itemName));
                return;
              }

              const message = `\n${craftForList}`;

              const Embd = Embed({
                title:
                    phrases.bot.itemInfo.item.embedTitle[config.language]
                        .replace(`{itemname}`, item.name),
                message:
                    phrases.bot.itemInfo.item.embedMessage[config.language]
                        .replace(`{obj}`, item.description || 'none.')
                        .replace(`{baseprice}`, item.basePrice)
                        .replace(`{lowprice}`, item.lastLowPrice || 'not sold on Flea.')
                        .replace(`{low24h}`, item.low24hPrice || 'not sold on Flea.')
                        .replace(`{high24h}`, item.high24hPrice || 'not sold on Flea.')
                        .replace(`{last48h}`, item.changeLast48h || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{usedintask}`, taskList || 'none.')
                        .replace(`{receivedFromTasks}`, taskreList || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{crabat}`, message || '')
                        .replace(`{vendorPrices}`, vendorPriceString)
                        .replace(`{wikilink}`, item.wikiLink),
                    thumbnail: item.iconLink
                });
                    
                interaction.editReply({ embeds: [Embd] });

              } catch (error) {
                console.error(error);
                interaction.editReply(phrases.bot.itemInfo.item.fetchingitem[config.language]);
              }
          } else if (extra === 'craftusing' || extra === 'cu')  {
            if (!itemId) {
              return interaction.editReply(phrases.bot.itemInfo.item.notFinditem[config.language].replace(`{obj}`, itemName));
          }
          try {
              const query = gql`
              {
                  item(id: "${itemId}") {
                    normalizedName
                    name
                    description
                    iconLink
                    wikiLink
                    basePrice
                    sellFor{
                      vendor{
                        name
                      }
                      price
                      currency
                    }
                    lastLowPrice
                    low24hPrice
                    high24hPrice
                    changeLast48h
                    changeLast48hPercent
                    usedInTasks {
                      name
                    }
                    receivedFromTasks{
                      name
                    }
                    craftsUsing {
                      level
                      station{
                        name
                      }
                      requiredItems{
                        item{
                          id
                          name
                          lastLowPrice
                          basePrice
                          sellFor{
                            price
                            currency
                          }
                        }
                        quantity
                      }
                      rewardItems{
                        item{
                          id
                          name
                          lastLowPrice
                          basePrice
                          sellFor{
                            price
                            currency
                          }
                        }
                        quantity
                      }
                      taskUnlock{
                        name
                      }
                      level
                    }
                }
            }`;
      
              const data = await request('https://api.tarkov.dev/graphql', query);
      
              const item = data.item;

              let taskList = '';
              const numTasks = item.usedInTasks.length;
              if (numTasks > 0) {
                const taskNames = [...new Set(item.usedInTasks.map(task => task.name))];
                const taskWord = numTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskList = `${numTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              let taskreList = '';
              const numreTasks = item.receivedFromTasks.length;
              if (numreTasks > 0) {
                const taskNames = [...new Set(item.receivedFromTasks.map(task => task.name))];
                const taskWord = numreTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskreList = `${numreTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              const percentChange = item.changeLast48hPercent;
              const changeEmoji = percentChange > 0 ? '📈' : '📉';
              const percentString = `${Math.abs(percentChange)}% ${changeEmoji}`;

              const vendors = item.sellFor;
              const vendorPrices = [];
              vendors.forEach((vendor) => {
                  if (vendor && vendor.vendor.name !== "Flea Market" && vendor.vendor.name !== "Fence") {
                      vendorPrices.push(`${vendor.vendor.name}: **${vendor.price} ${vendor.currency}**`);
                  }
              });
              let vendorPriceString = vendorPrices.join(', ');
  
              if (vendors.length < 1 || vendors === "[]") {
                  vendorPriceString = "Not bought by Traders."
              }

              const craftsUsing = item.craftsUsing;
              let craftList = '';
              const numCrafts = craftsUsing.length;
              if (numCrafts > 0) {
                craftList = `\n**${phrases.bot.itemInfo.item.craftsUsing[config.language]}**`;
                for (const craft of craftsUsing) {

                  const requiredItems = craft.requiredItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}/${Math.floor(item.quantity * price)}**)`;
                  }).join(', ');

                  const rewardItems = craft.rewardItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}**)`;
                  }).join(', ');

                  const requiredCosts = craft.requiredItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const rewardCosts = craft.rewardItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const unitCosts = craft.rewardItems.reduce((accumulator, item) => {
                    return accumulator + (rewardCosts / item.quantity);
                  }, 0);

                  const profit = (rewardCosts - requiredCosts);

                  let taskUnlock = "";
                  const taskUnlocks = craft.taskUnlock;
                  if (taskUnlocks === null) {
                    taskUnlock = "";
                  } else {
                    taskUnlock = ` - Task Required: **${taskUnlocks.name}**`;
                  }

                  const totalCosts = craft.rewardItems.reduce((accumulator, item) => {
                    let totalCost = "";
                    if (item.quantity > 1) {
                      totalCost = `Total P/C/UC: **${profit}/${requiredCosts}/${unitCosts}**`;
                    } else {
                      totalCost = `Total P/C: **${profit}/${requiredCosts}**`;
                    }

                    return accumulator + (totalCost);
                  }, "");

                  craftList += `${craftList.length > 0 ? `\n• ${craft.station.name} ${craft.level} ` : ''}- ${requiredItems} => ${rewardItems} - ${totalCosts}${taskUnlock}`;
                }
              } else {
                interaction.editReply(phrases.bot.itemInfo.item.noCrafts[config.language].replace(`{itemName}`, itemName));
                return;
              }

              const message = `\n${craftList}`;

              const Embd = Embed({
                title:
                    phrases.bot.itemInfo.item.embedTitle[config.language]
                        .replace(`{itemname}`, item.name),
                message:
                    phrases.bot.itemInfo.item.embedMessage[config.language]
                        .replace(`{obj}`, item.description || 'none.')
                        .replace(`{baseprice}`, item.basePrice)
                        .replace(`{lowprice}`, item.lastLowPrice || 'not sold on Flea.')
                        .replace(`{low24h}`, item.low24hPrice || 'not sold on Flea.')
                        .replace(`{high24h}`, item.high24hPrice || 'not sold on Flea.')
                        .replace(`{last48h}`, item.changeLast48h || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{usedintask}`, taskList || 'none.')
                        .replace(`{receivedFromTasks}`, taskreList || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{crabat}`, message || '')
                        .replace(`{vendorPrices}`, vendorPriceString)
                        .replace(`{wikilink}`, item.wikiLink),
                    thumbnail: item.iconLink
                });
                    
                interaction.editReply({ embeds: [Embd] });
    

            } catch (error) {
              console.error(error);
              interaction.editReply(phrases.bot.itemInfo.item.fetchingitem[config.language]);
            }
          } else if (extra === 'bartersfor' || extra === 'bf')  {
            if (!itemId) {
              return interaction.editReply(phrases.bot.itemInfo.item.notFinditem[config.language].replace(`{obj}`, itemName));
            }
            try {
                const query = gql`
                {
                    item(id: "${itemId}") {
                      normalizedName
                      name
                      description
                      iconLink
                      wikiLink
                      basePrice
                      sellFor{
                        vendor{
                          name
                        }
                        price
                        currency
                      }
                      lastLowPrice
                      low24hPrice
                      high24hPrice
                      changeLast48h
                      changeLast48hPercent
                      usedInTasks {
                        name
                      }
                      receivedFromTasks{
                        name
                      }
                      bartersFor{
                        level
                        trader{
                          name
                        }
                        requiredItems{
                          item{
                            id
                            name
                            lastLowPrice
                            basePrice
                            sellFor{
                              price
                              currency
                            }
                          }
                          quantity
                        }
                        rewardItems{
                          item{
                            id
                            name
                            lastLowPrice
                            basePrice
                            sellFor{
                              price
                              currency
                            }
                          }
                          quantity
                        }
                        taskUnlock{
                          name
                        }
                      }
                  }
              }`;
        
              const data = await request('https://api.tarkov.dev/graphql', query);
        
              const item = data.item;

              let taskList = '';
              const numTasks = item.usedInTasks.length;
              if (numTasks > 0) {
                const taskNames = [...new Set(item.usedInTasks.map(task => task.name))];
                const taskWord = numTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskList = `${numTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              let taskreList = '';
              const numreTasks = item.receivedFromTasks.length;
              if (numreTasks > 0) {
                const taskNames = [...new Set(item.receivedFromTasks.map(task => task.name))];
                const taskWord = numreTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskreList = `${numreTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              const percentChange = item.changeLast48hPercent;
              const changeEmoji = percentChange > 0 ? '📈' : '📉';
              const percentString = `${Math.abs(percentChange)}% ${changeEmoji}`;

              const vendors = item.sellFor;
              const vendorPrices = [];
              vendors.forEach((vendor) => {
                  if (vendor && vendor.vendor.name !== "Flea Market" && vendor.vendor.name !== "Fence") {
                      vendorPrices.push(`${vendor.vendor.name}: **${vendor.price} ${vendor.currency}**`);
                  }
              });
              let vendorPriceString = vendorPrices.join(', ');
  
              if (vendors.length < 1 || vendors === "[]") {
                  vendorPriceString = "Not bought by Traders."
              }

              const bartersFor = item.bartersFor;
              let bartersForList = '';
              const numBartersFor = bartersFor.length;
              if (numBartersFor > 0) {
                  bartersForList = `\n**${phrases.bot.itemInfo.item.bartersFor[config.language]}**`;
                for (const barter of bartersFor) {

                  const requiredItems = barter.requiredItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}/${Math.floor(item.quantity * price)}**)`;
                  }).join(', ');

                  const rewardItems = barter.rewardItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}**)`;
                  }).join(', ');

                  const requiredCosts = barter.requiredItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const rewardCosts = barter.rewardItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const unitCosts = barter.rewardItems.reduce((accumulator, item) => {
                    return accumulator + (rewardCosts / item.quantity);
                  }, 0);

                  const profit = (rewardCosts - requiredCosts);

                  let taskUnlock = "";
                  const taskUnlocks = barter.taskUnlock;
                  if (taskUnlocks === null) {
                    taskUnlock = "";
                  } else {
                    taskUnlock = ` - Task Required: **${taskUnlocks.name}**`;
                  }

                  const totalCosts = barter.rewardItems.reduce((accumulator, item) => {
                    let totalCost = "";
                    if (item.quantity > 1) {
                      totalCost = `Total P/C/UC: **${profit}/${requiredCosts}/${unitCosts}**`;
                    } else {
                      totalCost = `Total P/C: **${profit}/${requiredCosts}**`;
                    }

                    return accumulator + (totalCost);
                  }, "");

                  bartersForList += `${bartersForList.length > 0 ? `\n• ${barter.trader.name} ${barter.level} ` : ''}- ${requiredItems} => ${rewardItems} - ${totalCosts}${taskUnlock}`;
                }
              } else {
                interaction.editReply(phrases.bot.itemInfo.item.noBarter[config.language].replace(`{itemName}`, itemName));
                return;
              }

              const message = `\n${bartersForList}`;

              const Embd = Embed({
                title:
                    phrases.bot.itemInfo.item.embedTitle[config.language]
                        .replace(`{itemname}`, item.name),
                message:
                    phrases.bot.itemInfo.item.embedMessage[config.language]
                        .replace(`{obj}`, item.description || 'none.')
                        .replace(`{baseprice}`, item.basePrice)
                        .replace(`{lowprice}`, item.lastLowPrice || 'not sold on Flea.')
                        .replace(`{low24h}`, item.low24hPrice || 'not sold on Flea.')
                        .replace(`{high24h}`, item.high24hPrice || 'not sold on Flea.')
                        .replace(`{last48h}`, item.changeLast48h || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{usedintask}`, taskList || 'none.')
                        .replace(`{receivedFromTasks}`, taskreList || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{crabat}`, message || '')
                        .replace(`{vendorPrices}`, vendorPriceString)
                        .replace(`{wikilink}`, item.wikiLink),
                    thumbnail: item.iconLink
                });
                    
                interaction.editReply({ embeds: [Embd] });
    
            } catch (error) {
              console.error(error);
              interaction.editReply(phrases.bot.itemInfo.item.fetchingitem[config.language]);
            }
          }else if (extra === 'bartersusing' || extra === 'bu')  {
            if (!itemId) {
              return interaction.editReply(phrases.bot.itemInfo.item.notFinditem[config.language].replace(`{obj}`, itemName));
            }
            try {
                const query = gql`
                {
                    item(id: "${itemId}") {
                      normalizedName
                      name
                      description
                      iconLink
                      wikiLink
                      basePrice
                      sellFor{
                        vendor{
                          name
                        }
                        price
                        currency
                      }
                      lastLowPrice
                      low24hPrice
                      high24hPrice
                      changeLast48h
                      changeLast48hPercent
                      usedInTasks {
                        name
                      }
                      receivedFromTasks{
                        name
                      }
                      bartersUsing{
                        level
                        trader{
                          name
                        }
                        requiredItems{
                          item{
                            id
                            name
                            lastLowPrice
                            basePrice
                            sellFor{
                              price
                              currency
                            }
                          }
                          quantity
                        }
                        rewardItems{
                          item{
                            id
                            name
                            lastLowPrice
                            basePrice
                            sellFor{
                              price
                              currency
                            }
                          }
                          quantity
                        }
                        taskUnlock{
                          name
                        }
                      }
                  }
              }`;
        
              const data = await request('https://api.tarkov.dev/graphql', query);
        
              const item = data.item;

              let taskList = '';
              const numTasks = item.usedInTasks.length;
              if (numTasks > 0) {
                const taskNames = [...new Set(item.usedInTasks.map(task => task.name))];
                const taskWord = numTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskList = `${numTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              let taskreList = '';
              const numreTasks = item.receivedFromTasks.length;
              if (numreTasks > 0) {
                const taskNames = [...new Set(item.receivedFromTasks.map(task => task.name))];
                const taskWord = numreTasks === 1 ? phrases.bot.itemInfo.item.task[config.language] : phrases.bot.itemInfo.item.tasks[config.language];
                taskreList = `${numreTasks} ${taskWord}: ${taskNames.join(', ')}`;
              }

              const percentChange = item.changeLast48hPercent;
              const changeEmoji = percentChange > 0 ? '📈' : '📉';
              const percentString = `${Math.abs(percentChange)}% ${changeEmoji}`;

              const vendors = item.sellFor;
              const vendorPrices = [];
              vendors.forEach((vendor) => {
                  if (vendor && vendor.vendor.name !== "Flea Market" && vendor.vendor.name !== "Fence") {
                      vendorPrices.push(`${vendor.vendor.name}: **${vendor.price} ${vendor.currency}**`);
                  }
              });
              let vendorPriceString = vendorPrices.join(', ');
  
              if (vendors.length < 1 || vendors === "[]") {
                  vendorPriceString = "Not bought by Traders."
              }

              const bartersUsing = item.bartersUsing;
              let bartersUsingList = '';
              const numBartersUsing = bartersUsing.length;
              if (numBartersUsing > 0) {
                  bartersUsingList = `\n**${phrases.bot.itemInfo.item.bartersUsing[config.language]}**`;
                for (const barter of bartersUsing) {

                  const requiredItems = barter.requiredItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}/${Math.floor(item.quantity * price)}**)`;
                  }).join(', ');

                  const rewardItems = barter.rewardItems.map(item => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return `${item.quantity}x ${item.item.name} (**${price}**)`;
                  }).join(', ');

                  const requiredCosts = barter.requiredItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const rewardCosts = barter.rewardItems.reduce((accumulator, item) => {
                    let price = 0;
                    if (item.item.lastLowPrice === null) {
                      const prices = item.item.sellFor;
                      prices.forEach((item) => {
                        if (item.currency === 'RUB' && item.price > price) {
                          price = item.price;
                        }
                      });
                    } else {
                      price = item.item.lastLowPrice;
                    }
                    return accumulator + (item.quantity * price);
                  }, 0);

                  const unitCosts = barter.rewardItems.reduce((accumulator, item) => {
                    return accumulator + (rewardCosts / item.quantity);
                  }, 0);

                  const profit = (rewardCosts - requiredCosts);

                  let taskUnlock = "";
                  const taskUnlocks = barter.taskUnlock;
                  if (taskUnlocks === null) {
                    taskUnlock = "";
                  } else {
                    taskUnlock = ` - Task Required: **${taskUnlocks.name}**`;
                  }

                  const totalCosts = barter.rewardItems.reduce((accumulator, item) => {
                    let totalCost = "";
                    if (item.quantity > 1) {
                      totalCost = `Total P/C/UC: **${profit}/${requiredCosts}/${unitCosts}**`;
                    } else {
                      totalCost = `Total P/C: **${profit}/${requiredCosts}**`;
                    }

                    return accumulator + (totalCost);
                  }, "");

                  bartersUsingList += `${bartersUsingList.length > 0 ? `\n• ${barter.trader.name} ${barter.level} ` : ''}- ${requiredItems} => ${rewardItems} - ${totalCosts}${taskUnlock}`;
                }
              } else {
                interaction.editReply(phrases.bot.itemInfo.item.noBarter[config.language].replace(`{itemName}`, itemName));
                return;
              }

              const message = `\n${bartersUsingList}`;

              const Embd = Embed({
                title:
                    phrases.bot.itemInfo.item.embedTitle[config.language]
                        .replace(`{itemname}`, item.name),
                message:
                    phrases.bot.itemInfo.item.embedMessage[config.language]
                        .replace(`{obj}`, item.description || 'none.')
                        .replace(`{baseprice}`, item.basePrice)
                        .replace(`{lowprice}`, item.lastLowPrice || 'not sold on Flea.')
                        .replace(`{low24h}`, item.low24hPrice || 'not sold on Flea.')
                        .replace(`{high24h}`, item.high24hPrice || 'not sold on Flea.')
                        .replace(`{last48h}`, item.changeLast48h || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{usedintask}`, taskList || 'none.')
                        .replace(`{receivedFromTasks}`, taskreList || 'none.')
                        .replace(`{last48hP}`, percentString)
                        .replace(`{crabat}`, message || '')
                        .replace(`{vendorPrices}`, vendorPriceString)
                        .replace(`{wikilink}`, item.wikiLink),
                    thumbnail: item.iconLink
                });
                    
                interaction.editReply({ embeds: [Embd] });
    
            } catch (error) {
              console.error(error);
              interaction.editReply(phrases.bot.itemInfo.item.fetchingitem[config.language]);
            }
          }
      }
}