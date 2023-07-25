// Import Packages
import colors from 'chalk'
import dotenv from 'dotenv'
import { request, gql } from 'graphql-request'
import Embed from '../libs/embed.js'
import phrases from '../../translation.js'
import momentTz from 'moment-timezone'
import log from '../libs/logging.js'

// Import Config & Init
import config from '../../config.js'
dotenv.config()

const itemID = {
    "item" : [
        {
            "ID" : "5d6fc78386f77449d825f9dc",
            "Price" : 50000
        },
        {
            "ID": "5e2af41e86f774755a234b67",
            "Price" : 20000
        },
        {
            "ID": "5d03775b86f774203e7e0c4b",
            "Price" : 175000
        }
    ]
};

export default {
    name: 'ready',
    once: true,

    async execute(client) {
        // Store message ID and initial price
        let messageId = null;
        let initialPrice = null;
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
      
          console.log(recentPrices);
      
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
      
            let itemNameBF = itemInfo.name;
            let itemName = itemNameBF.replace(/"/g, '');
      
            console.log(`${itemName} Current price: ${items.price} and Initial price: ${initialPrice} at ${dateStr} thats ${inMinutes} minutes ago -- ${initialPrice !== null}`);

            console.log(timesinceposting);
            console.log(timesinceposting < 300000);
            console.log(timesinceposting > -3600000);
            console.log(items.price > item.Price);
      
            if (timesinceposting < 300000 && timesinceposting > -3600000 && items.price > item.Price) {
              // Store initial price
              initialPrice = items.price;
              console.log(`Initial Price - ${initialPrice}`);
      
              // Send initial embed
              const Embd = Embed({
                title: phrases.bot.it.itemgoingup.embedTitle[config.language]
                  .replace(`{item}`, itemName),
                message: phrases.bot.it.itemgoingup.embedMessage[config.language]
                  .replace(`{itemName}`, itemName)
                  .replace(`{itemPrice}`, items.price)
                  .replace(`{firstten}`, first_ten),
                thumbnail: itemInfo.imageLink
              });
              const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
              itemChannel.send({ embeds: [Embd] })
                .then(message => {
                  messageId = message.id;
                  console.log(`Sent Message ID - ${messageId}`);
                });
            } else if (items.price > initialPrice && initialPrice !== null) {
              // Price went up, update embed message
              const Embd = Embed({
                title: phrases.bot.it.itemgoingup.embedTitle[config.language]
                  .replace(`{item}`, itemName),
                message: phrases.bot.it.itemgoingup.embedMessage[config.language]
                  .replace(`{itemName}`, itemName)
                  .replace(`{itemPrice}`, items.price)
                  .replace(`{firstten}`, first_ten),
                thumbnail: itemInfo.imageLink
              });
      
              const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
              itemChannel.messages.fetch(messageId)
                .then(message => {
                  message.edit({ embeds: [Embd] });
                });
            } else if (items.price < initialPrice && initialPrice !== null) {
              // Price went down, update embed message
              const Embd = Embed({
                title: phrases.bot.it.itemgoingdown.embedTitle[config.language]
                  .replace(`{item}`, itemName),
                message: phrases.bot.it.itemgoingdown.embedMessage[config.language]
                  .replace(`{itemName}`, itemName)
                  .replace(`{itemPrice}`, items.price),
                thumbnail: itemInfo.imageLink
              });
      
              const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
              itemChannel.messages.fetch(messageId)
                .then(message => {
                  message.edit({ embeds: [Embd] });
                });
            }
          }
        };

        let itemIndex = 0; // Initialize item index to 0
      
        const runLoop = async () => {
            if (isLoopRunning) {
                return; // Exit the function if the loop is already running
            }
      
            isLoopRunning = true; // Set the loop running flag to true

            const currentItem = itemID.item[itemIndex]; // Get the current item

            console.log(`Index - ${itemIndex} - ${itemID.item[itemIndex].ID}/${itemID.item[itemIndex].Price}`);
      
            await processItem(currentItem);
      
            isLoopRunning = false; // Set the loop running flag to false

            // Move to the next item index
            itemIndex = (itemIndex + 1) % itemID.item.length;
      
            // Recursively call the runLoop function after the specified delay
            setTimeout(() => runLoop(itemIndex), 120000);
            console.log(`Index - ${itemIndex} - ${itemID.item[itemIndex].ID}/${itemID.item[itemIndex].Price}`);
        };
      
          runLoop();
      }      
}
