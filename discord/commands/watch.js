import { SlashCommandBuilder } from '@discordjs/builders';
import IT_Ready from '../events/IT_Ready.js';
import config from '../../config.js';
import phrases from '../../translation.js';
import Embed from '../libs/embed.js';
import { client } from '../../index.js'
import fs from 'fs';

export default {
  name: 'watch',
  description: 'Manage item we are monitoring',

  register() {
    const data = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) => option.setName('command').setRequired(true).setDescription('The command to execute'))
    .addStringOption((option) => option.setName('item-name').setRequired(false).setDescription('The name of the item'))
    .addIntegerOption((option) => option.setName('price').setRequired(false).setDescription('The price of the item'))
    .toJSON();
    return data;
},

  async execute(interaction) {
    const command = interaction.options.getString('command');
    const itemName = interaction.options.getString('item-name');  
    const price = interaction.options.getInteger('price');

    const itemID = IT_Ready.itemID;

    const ITEM_FILE = './data/items.json';
    const ITEMID_FILE = './data/itemID.json';

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

    switch (command) {
      case 'add':
        if (!itemName || !price) {
            interaction.reply({
                content: 'Please provide the itemName and price of the item.',
                ephemeral: true,
            });
            return;
        }
        let nameAdd;
        let matchingAddItems = itemData.items.filter(([id, name, shortname]) => {
            const shortnameWithoutHyphens = shortname.replace('-', '').toLowerCase();
            const itemshortnameWithoutHyphens = itemName.replace('-', '').toLowerCase();
            const shortnameKeywords = shortnameWithoutHyphens.split(/\s+/);
            const itemshortnameKeywords = itemshortnameWithoutHyphens.split(/\s+/);
          
            const nameWithoutHyphens = name.replace('-', '').toLowerCase();
            nameAdd = nameWithoutHyphens;
            const itemNameWithoutHyphens = itemName.replace('-', '').toLowerCase();
            const nameKeywords = nameWithoutHyphens.split(/\s+/);
            const itemNameKeywords = itemNameWithoutHyphens.split(/\s+/);
            return itemNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameWithoutHyphens.includes(itemNameWithoutHyphens) || itemshortnameKeywords.every(keyword => shortnameKeywords.includes(keyword)) || shortnameKeywords.every(keyword => keyword === itemshortnameWithoutHyphens);
        });
        config.bot.itemPrices.debug.enabled && console.log(matchingAddItems);
        if (matchingAddItems) {
            const [matchingItem] = matchingAddItems;
            config.bot.itemPrices.debug.enabled && console.log(matchingItem);
            //const { ID, name, shorename } = matchingItem;

            const ID = matchingItem[0];
            const name = matchingItem[1];
            const shortname = matchingItem[2];

            interaction.reply({content: `Found a matching item: ID: ${ID}, Name: ${name}\nReact with ✅ to confirm or ❌ to cancel.`, fetchReply: true})
                .then((message) => {
                    message.react('✅'); // Add checkmark emoji reaction
                    message.react('❌'); // Add x emoji reaction
                
                    const filter = (reaction, user) => {
                        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
                };
          
              message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
                .then((collected) => {
                  const reaction = collected.first();
                  if (reaction.emoji.name === '✅') {
                    // User confirmed the item
                    itemID.item.push({ ID: ID, Name: name, Price: price });
                    fs.writeFile(ITEMID_FILE, JSON.stringify(itemID), (err) => {
                      if (err) {
                        console.error(err);
                        interaction.followUp({
                          content:
                            'An error occurred while writing to the itemID.json file.',
                          ephemeral: true,
                        });
                      } else {
                        message.delete();
                        interaction.followUp({
                          content: 'The item was successfully added!',
                          ephemeral: true,
                        });
                      }
                    });
                    // Continue with the rest of the code for adding or removing the item using itemID
                  } else {
                    // User canceled
                    interaction.followUp({
                      content: 'You canceled the operation.',
                      ephemeral: true,
                    });
                  }
                })
                .catch((error) => {
                  message.delete();
                  console.error(error);
                  interaction.followUp({
                    content: 'An error occurred while awaiting reactions.',
                    ephemeral: true,
                  });
                });
            });
        } else if (!matchingAddItems) {
            interaction.reply({
              content: 'No matching items found.',
              ephemeral: true,
            });
        }
        break;
      case 'remove':
        if (!itemName) {
          interaction.reply({
            content: 'Please provide the itemName of the item to remove.',
            ephemeral: true,
          });
          return;
        }
        // Filter matching items based on itemName
        const ITEMRMNAME_FILE = './data/items.json';
        let itemRMNameData = [];
        try {
            if (fs.existsSync(ITEMRMNAME_FILE)) {
                const data = fs.readFileSync(ITEMRMNAME_FILE, 'utf8');
                itemRMNameData = JSON.parse(data);
            } else {
                console.log(`No ${ITEMRMNAME_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }
        let matchingRMItems = itemRMNameData.items.filter(([id, name, shortname]) => {
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
        config.bot.itemPrices.debug.enabled && console.log(matchingRMItems);
        if (matchingRMItems) {
            const [matchingItem] = matchingRMItems;
            config.bot.itemPrices.debug.enabled && console.log(matchingItem);
            //const { ID, name, shorename } = matchingItem;

            const ID = matchingItem[0];
            const name = matchingItem[1];
            const shortname = matchingItem[2];

            interaction.reply({
                content: `Found a matching item: ID: ${ID}, Name: ${name}\nReact with ✅ to confirm or ❌ to cancel.`, fetchReply: true})
                    .then((message) => {
                        message.react('✅'); // Add checkmark emoji reaction
                        message.react('❌'); // Add x emoji reaction
                    
                        const filter = (reaction, user) => {
                        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
                    };
            
                message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
                .then((collected) => {
                    const reaction = collected.first();
                    if (reaction.emoji.name === '✅') {
                    // User confirmed the item
                    const indexToRemove = itemID.item.findIndex((item) => item.ID === ID);
                    if (indexToRemove === -1) {
                      interaction.followUp({
                        content: 'The item to remove was not found.',
                        ephemeral: true,
                      });
                      return;
                    }
                    itemID.item.splice(indexToRemove, 1);
                    fs.writeFile(ITEMID_FILE, JSON.stringify(itemID), (err) => {
                      if (err) {
                        console.error(err);
                        interaction.followUp({
                          content:
                            'An error occurred while writing to the itemID.json file.',
                          ephemeral: true,
                        });
                      } else {
                        message.delete();
                        interaction.followUp({
                          content: 'The item was successfully removed!',
                          ephemeral: true,
                        });
                      }
                    });
                    // Continue with the rest of the code for adding or removing the item using itemID
                    } else {
                    // User canceled
                    interaction.followUp({
                        content: 'You canceled the operation.',
                        ephemeral: true,
                    });
                    }
                })
                .catch((error) => {
                  message.delete();
                  console.error(error);
                  interaction.followUp({
                    content: 'An error occurred while awaiting reactions.',
                    ephemeral: true,
                  });
                });
            });
        } else if (!matchingRMItems) {
            interaction.reply({
                content: 'No matching items found.',
                ephemeral: true,
            });
        }
        break;
      case 'list':
        const itemList = itemID.item
          .map((item) => `ID: ${item.ID}, Name: ${item.Name}, Price: ${item.Price}`)
          .join('\n');
        interaction.reply({ content: `The current items are:\n${itemList}` });
        break;
      case 'edit':
        if (!itemName || !price) {
          interaction.reply({
            content: 'Please provide the itemName and new price of the item.',
            ephemeral: true,
          });
          return;
        }
        // Filter matching items based on itemName
        const ITEMEDITNAME_FILE = './data/items.json';
        let itemEditNameData = [];
        try {
            if (fs.existsSync(ITEMEDITNAME_FILE)) {
                const data = fs.readFileSync(ITEMEDITNAME_FILE, 'utf8');
                itemEditNameData = JSON.parse(data);
            } else {
                console.log(`No ${ITEMEDITNAME_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }
        let matchingEditItems = itemEditNameData.items.filter(([id, name, shortname]) => {
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
        if (matchingEditItems.length === 0) {
          interaction.reply({
            content: 'No matching items found.',
            ephemeral: true,
          });
          return;
        }
        if (matchingEditItems.length > 1) {
          interaction.reply({
            content: 'Multiple items match the provided itemName. Please provide a more specific name.',
            ephemeral: true,
          });
          return;
        }
        const [matchingEditItem] = matchingEditItems;

        const ID = matchingEditItem[0];
        const name = matchingEditItem[1];
        const shortname = matchingEditItem[2];
      
        interaction.reply({
          content: `Found a matching item: ID: ${ID}, Name: ${name}\nReact with ✅ to confirm editing the price or ❌ to cancel.`,
          fetchReply: true,
        })
          .then((message) => {
            message.react('✅'); // Add checkmark emoji reaction
            message.react('❌'); // Add x emoji reaction
      
            const filter = (reaction, user) => {
              return ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id;
            };
      
            message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
              .then((collected) => {
                const reaction = collected.first();
                if (reaction.emoji.name === '✅') {
                  // User confirmed editing the price
                  const indexToEdit = itemID.item.findIndex((item) => item.ID === ID);
                  if (indexToEdit === -1) {
                    interaction.followUp({
                      content: 'The item to edit was not found.',
                      ephemeral: true,
                    });
                    return;
                  }
                  itemID.item[indexToEdit].Price = price;
                  fs.writeFile(ITEMID_FILE, JSON.stringify(itemID), (err) => {
                    if (err) {
                      console.error(err);
                      interaction.followUp({
                        content: 'An error occurred while writing to the itemID.json file.',
                        ephemeral: true,
                      });
                    } else {
                      message.delete();
                      interaction.followUp({
                        content: 'The item price was successfully edited!',
                        ephemeral: true,
                      });
                    }
                  });
                  // Continue with the rest of the code for adding or removing the item using itemID
                } else {
                  // User canceled
                  interaction.followUp({
                    content: 'You canceled the operation.',
                    ephemeral: true,
                  });
                }
              })
              .catch((error) => {
                message.delete();
                console.error(error);
                interaction.followUp({
                  content: 'An error occurred while awaiting reactions.',
                  ephemeral: true,
                });
              });
          });
        break;                
      default:
        interaction.reply({ content: 'Invalid command.', ephemeral: true });
        break;
    }
  },
};
