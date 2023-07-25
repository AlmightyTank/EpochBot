// Import Packages
import colors from 'chalk'
import dotenv from 'dotenv'
import { request, gql } from 'graphql-request'
import Embed from '../libs/embed.js'
import phrases from '../../translation.js'
import fs from 'fs/promises'; // Import the fs module for file operations

// Import Config & Init
import config from '../../config.js'
dotenv.config()

let itemID; // Declare itemID variable

// Load itemID data from JSON file
try {
  const jsonData = await fs.readFile('./data/itemID.json', 'utf8');
  itemID = JSON.parse(jsonData);
} catch (err) {
  console.error('Error loading itemID.json:', err);
  process.exit(1); // Exit the process if there's an error
}

export default {
    name: 'ready',
    once: true,
    itemID,

    async execute(client) {
        // Store message ID and initial price
        let messageIds = []; // Array to store message IDs and IDs for each item
        let initialPrices = []; // Array to store initial prices and IDs for each item
        let itemPrices = [];
        let itemInfo = [];
        let isLoopRunning = false; // Flag to indicate if the loop is already running
      
        const updateItem = async (item) => {
          const query = gql`
            {
              historicalItemPrices(id: "${item.ID}") {
                price
                timestamp
              }
              item(id: "${item.ID}") {
                normalizedName
                name
                iconLink
              }
            }
          `;
      
          const data = await request('https://api.tarkov.dev/graphql', query);
      
          itemPrices = data.historicalItemPrices;
          itemInfo = data.item;
        };
      
        const processItem = async (item) => {
          await updateItem(item);
      
          const recentPrices = itemPrices.slice(-2); // Get the last two recent prices
      
          //config.bot.itemPrices.debug.enabled && console.log(recentPrices);
      
          for (const [i, items] of recentPrices.entries()) {
            await new Promise(resolve => setTimeout(resolve, 10000 * i)); // Introduce a delay between each iteration
      
            let timestamp = items.timestamp;

            let resetValTime = timestamp.valueOf();
    
            let epochTimeString = resetValTime.toString();
            let first_ten = epochTimeString.substring(0, 10);

            let datestamp = Date.now();

            let dateValTime = datestamp.valueOf();
    
            let epochdateString = dateValTime.toString();
            let first_ten_date = epochdateString.substring(0, 10);

            let myDate = new Date(first_ten * 1000);
            
            let nowDate = new Date(first_ten_date * 1000);

            myDate.setHours(myDate.getHours() - 5);
            nowDate.setHours(nowDate.getHours() - 5);
        
            // using various methods of Date class to get year, date, month, hours, minutes, and seconds.
            let dateStr = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate() + " " + myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()
        
            let timesinceposting = myDate - nowDate;

            let inSeconds = Math.floor(timesinceposting / 1000);

            let inMinutes = Math.floor(timesinceposting / (1000 * 60));
      
            let itemName = itemInfo.name.replace(/"/g, '');
      
            // Check if a message with the given message ID exists
            const messageId = findMessageId(item.ID);
            const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
            const message = messageId ? await itemChannel.messages.fetch(messageId).catch(console.error) : null;

            console.log(colors.yellow(`            [=] ${itemName} Current price: ${items.price} and Initial price: ${findInitialPrice(item.ID)} at ${dateStr} that's ${inMinutes} minutes ago -- ${findInitialPrice(item.ID) !== null}`));
            //config.bot.itemPrices.debug.enabled && console.log(`${timesinceposting} - ${timesinceposting < 300000 && timesinceposting > -7200000} - ${!message && items.price > item.Price} - ${items.price > findMessagePrice(item.ID) && items.price > findInitialPrice(item.ID) && findInitialPrice(item.ID) !== null && first_ten < findMessageTime(item.ID)} - ${items.price < findMessagePrice(item.ID) && items.price < findInitialPrice(item.ID) && findInitialPrice(item.ID) !== null && first_ten < findMessageTime(item.ID)}`);
            
            console.log(colors.yellow(`
            [=====================================]
            [=] ${timesinceposting} // First // ${timesinceposting < 300000} - ${timesinceposting > -7200000} // Second // ${!message} - ${items.price > item.Price} // Third // ${items.price > findMessagePrice(item.ID)} - ${items.price > findInitialPrice(item.ID)} - ${findInitialPrice(item.ID) !== null} // Forth // ${items.price < findMessagePrice(item.ID)} - ${items.price < findInitialPrice(item.ID)} - ${findInitialPrice(item.ID) !== null} - ${first_ten != findMessageTime(item.ID)}
            [=====================================]
            `))

            if (timesinceposting < 300000 && timesinceposting > -7200000) {

              if (!message && items.price > item.Price) {
                // Store initial price and message ID
                initialPrices.push({ id: item.ID, price: items.price });
                //config.bot.itemPrices.debug.enabled && console.log(`Initial Price - ${findInitialPrice(item.ID)}`);

                // Send initial embed
                const Embd = Embed({
                  title: phrases.bot.it.itemgoingup.embedTitle[config.language]
                    .replace(`{item}`, itemName),
                  message: phrases.bot.it.itemgoingup.embedMessage[config.language]
                    .replace(`{itemPrice}`, items.price)
                    .replace(`{firstten}`, first_ten),
                  thumbnail: itemInfo.iconLink
                });

                itemChannel.send({ embeds: [Embd] })
                  .then(message => {
                    messageIds.push({ id: item.ID, messageId: message.id, price: items.price, time: first_ten });
                    //config.bot.itemPrices.debug.enabled && console.log(`Sent Message ID - ${findMessageId(item.ID)}`);
                });
              } else if (items.price > findMessagePrice(item.ID) && items.price > findInitialPrice(item.ID) && findInitialPrice(item.ID) !== null && first_ten != findMessageTime(item.ID)) {
                // Price went up, update embed message
                const Embd = Embed({
                  title: phrases.bot.it.itemgoingup.embedTitle[config.language]
                    .replace(`{item}`, itemName),
                  message: phrases.bot.it.itemgoingup.embedMessage[config.language]
                    .replace(`{itemName}`, itemName)
                    .replace(`{itemPrice}`, items.price)
                    .replace(`{firstten}`, first_ten),
                  thumbnail: itemInfo.iconLink
                });
                console.log(colors.yellow(`            [=] Message ID stored in messageIds: ${findMessageId(item.ID)}`));
                const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
                const message = await itemChannel.messages.fetch(findMessageId(item.ID));
                //const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
                //itemChannel.messages.fetch(findMessageId(item.ID))
                //const fetchMsg = message.first();
                console.log(colors.yellow(`            [=] Message ID: ${message.id}`));
                message.edit({ embeds: [Embd] });
              } else if (items.price < findMessagePrice(item.ID) && items.price < findInitialPrice(item.ID) && findInitialPrice(item.ID) !== null && first_ten != findMessageTime(item.ID)) {
                  // Price went down, update embed message
                  const Embd = Embed({
                    title: phrases.bot.it.itemgoingdown.embedTitle[config.language]
                      .replace(`{item}`, itemName),
                    message: phrases.bot.it.itemgoingdown.embedMessage[config.language]
                      .replace(`{itemName}`, itemName)
                      .replace(`{itemPrice}`, items.price)
                      .replace(`{firstten}`, first_ten),
                    thumbnail: itemInfo.iconLink
                  });
                  console.log(colors.yellow(`            [=] Message ID stored in messageIds: ${findMessageId(item.ID)}`));
                  const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
                  const message = await itemChannel.messages.fetch(findMessageId(item.ID));
                  //const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
                  //itemChannel.messages.fetch(findMessageId(item.ID))
                  //const fetchMsg = message.first();
                  console.log(colors.yellow(`            [=] Message ID: ${message.id}`));
                  message.edit({ embeds: [Embd] });
                    
                  setTimeout(() => {
                    // Delete the message after 5 minutes
                    if (!message) {
                      message.delete().catch(() => null);
                    }
                      
                    // Remove the item's initial price and message ID from arrays
                    const initialPriceIndex = initialPrices.findIndex(price => price.id === item.ID);
                    const messageIdIndex = messageIds.findIndex(msg => msg.id === item.ID);

                    if (initialPriceIndex !== -1 && messageIdIndex !== -1) {
                      initialPrices.splice(initialPriceIndex, 1);
                      messageIds.splice(messageIdIndex, 1);
                      config.bot.itemPrices.debug.enabled && console.log(`Removed item from initialPrices and messageIds - ID: ${item.ID}`);
                    }
                  }, 5 * 60 * 1000); // 5 minutes delay (5 * 60 seconds * 1000 milliseconds)
                }
              }           
            }
          };

        // Helper function to find the initial price for a given item ID
        const findInitialPrice = (itemId) => {
          const item = initialPrices.find(price => price.id === itemId);
          return item ? item.price : null;
        };

        // Helper function to find the message ID for a given item ID
        const findMessageId = (itemId) => {
          const item = messageIds.find(msg => msg.id === itemId);
          return item ? item.messageId : null;
        };

        const findMessagePrice = (itemId) => {
          const item = messageIds.find(msg => msg.id === itemId);
          return item ? item.price : null;
        };

        const findMessageTime = (itemId) => {
          const item = messageIds.find(msg => msg.id === itemId);
          return item ? item.time : null;
        };

        let itemIndex = 0; // Initialize item index to 0
        const runLoop = async () => {
            if (isLoopRunning) {
                return; // Exit the function if the loop is already running
            }
      
            isLoopRunning = true; // Set the loop running flag to true

            const currentItem = itemID.item[itemIndex]; // Get the current item

            //config.bot.itemPrices.debug.enabled && console.log(`Index - ${itemIndex} - ${itemID.item[itemIndex].ID}/${itemID.item[itemIndex].Price}`);
      
            await processItem(currentItem);
      
            isLoopRunning = false; // Set the loop running flag to false

            // Move to the next item index
            itemIndex = (itemIndex + 1) % itemID.item.length;
      
            // Recursively call the runLoop function after the specified delay
            setTimeout(() => runLoop(itemIndex), 60000);
            //config.bot.itemPrices.debug.enabled && console.log(`Index - ${itemIndex} - ${itemID.item[itemIndex].ID}/${itemID.item[itemIndex].Price}`);
        };
      
        runLoop();
    }      
}