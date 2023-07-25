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
            "Price" : 40000
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

        for (const item of itemID.item) {

            async function updateitems () {
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
        
                return itemPrices = data.historicalItemPrices, itemInfo = data.item;
            }
            
            await updateitems();

            const runLoop = async () => {
                if (isLoopRunning) {
                    return; // Exit the function if the loop is already running
                }

                isLoopRunning = true; // Set the loop running flag to true

                await updateitems();
                
                const recentPrices = itemPrices.slice(-2); // Get the last two recent prices

                console.log(recentPrices);

                for (const [i, items] of recentPrices.entries()) {

                    setTimeout(async () => {

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
                            
                            //if(timesinceposting < 300000 && timesinceposting > -300000 && items.price > item.Price) {
                                //console.log(first_ten);
                                //console.log(first_ten_date);
                                //console.log(nowDate);
                                //console.log(myDate);
                            //}

                            let itemName = itemInfo.name.replace(/"/g, '');
                            
                            console.log(`${itemName} Current price: ${items.price} and Initial price: ${initialPrice} at ${dateStr} thats ${inMinutes} minutes ago -- ${initialPrice !== null}`);
                            if (timesinceposting < 300000 && timesinceposting > 0 && items.price > item.Price) {
                                // Store initial price
                                initialPrice = items.price;
                                console.log(`Initial Price - ${initialPrice}`);

                                // Send initial embed
                                const Embd = Embed({
                                    title:
                                        phrases.bot.it.itemgoingup.embedTitle[config.language]
                                            .replace(`{item}`, itemName),
                                    message:
                                        phrases.bot.it.itemgoingup.embedMessage[config.language]
                                            .replace(`{itemName}`, itemName)
                                            .replace(`{itemPrice}`, items.price)
                                            .replace(`{firstten}`, first_ten),
                                    thumbnail: itemInfo.imageLink
                                })
                                const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel)
                                itemChannel.send({embeds: [Embd]})
                                    .then(message => {
                                        messageId = message.id;
                                        console.log(`Sent Message ID - ${messageId}`);
                                    });
                            } else if (items.price > initialPrice && initialPrice !== null) {
                                // Price went up, update embed message
                                const Embd = Embed({
                                    title:
                                        phrases.bot.it.itemgoingup.embedTitle[config.language]
                                            .replace(`{item}`, itemName),
                                    message:
                                        phrases.bot.it.itemgoingup.embedMessage[config.language]
                                            .replace(`{itemName}`, itemName)
                                            .replace(`{itemPrice}`, items.price)
                                            .replace(`{firstten}`, first_ten),
                                    thumbnail: itemInfo.imageLink
                                })

                                const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
                                itemChannel.messages.fetch(messageId)
                                    .then(message => {
                                        message.edit({embeds: [Embd]});
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            } else if (items.price < initialPrice && initialPrice !== null) {
                                // Price went down, delete embed message
                                const itemChannel = client.channels.cache.get(config.bot.itemPrices.discordChannel);
                                itemChannel.messages.fetch(messageId)
                                    .then(message => {
                                        message.delete();
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                                // Reset initial price and message ID
                                initialPrice = null;
                                messageId = null;
                            }
                        }, 10000 * i)
                    }
                isLoopRunning = false; // Set the loop running flag to false
                setTimeout(runLoop, 120000);
            };
            runLoop();
        }
    }
}
