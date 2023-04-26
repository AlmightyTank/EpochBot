// Import Packages
import colors from 'chalk'
import dotenv from 'dotenv'
import { request, gql } from 'graphql-request'
import Embed from '../libs/embed.js'
import phrases from '../../translation.js'
import log from '../libs/logging.js'

// Import Config & Init
import config from '../../config.js'
dotenv.config()

const alreadySent = new Map(); // create a new map to store the already sent messages

let intervalCounter = 0; // initialize interval counter

export default {
    name: 'ready',
    once: true,

    async execute(client) {
    let traders = [];

    async function updateTraders () {
        const query = gql`
        {
            traders {
                name
                resetTime
                imageLink
            }
        }
    `;

        const data = await request('https://api.tarkov.dev/graphql', query);

        return traders = data.traders;
    }

    async function tradersForEach () {
        await traders.forEach(async (trader, i) => {

            setTimeout(async () => {

                if (trader.name === 'Lightkeeper' || trader.name === 'Fence') return;

                const resetTime = new Date(trader.resetTime);

                const datestamp = Date.now();

                const dateValTime = datestamp.valueOf();
            
                const epochdateString = dateValTime.toString();
                const first_ten_date = epochdateString.substring(0, 10);

                const resetValTime = resetTime.valueOf();
        
                const epochTimeString = resetValTime.toString();
                const first_ten = epochTimeString.substring(0, 10);

                const myDate = new Date(first_ten * 1000);
                    
                const nowDate = new Date(first_ten_date * 1000);

                myDate.setHours(myDate.getHours() - 5);
                nowDate.setHours(nowDate.getHours() - 5);

                const timeUntilReset = myDate - nowDate;

                let isTime = false;
                if (timeUntilReset < 360000 && timeUntilReset > 0) {
                    isTime = true;
                } else {
                    isTime = false;
                }

                const month = (nowDate.getMonth() + 1).toString().padStart(2, '0');
                const date = nowDate.getDate().toString().padStart(2, '0');
                const hours = nowDate.getHours().toString().padStart(2, '0');
                const minutes = nowDate.getMinutes().toString().padStart(2, '0');
                const seconds = nowDate.getSeconds().toString().padStart(2, '0');
                const dateStr = `${nowDate.getFullYear()}/${month}/${date} ${hours}:${minutes}:${seconds}`;

                if (!config.bot.traderreset.debug.enabled) {
                    if (isTime === true) {
                        console.log(colors.green(`            [${dateStr}] ${trader.name} Time Left: ${timeUntilReset} // Is it Time: ${isTime} // Already Sent: ${alreadySent.has(trader.name)} // ${intervalCounter} Successful Intervals`));
                    }
                }

                if (config.bot.traderreset.debug.enabled) {
                    if (isTime === true) {
                        console.log(colors.green(`            [${dateStr}] ${trader.name} Time Left: ${timeUntilReset} // Is it Time: ${isTime} // Already Sent: ${alreadySent.has(trader.name)} // ${intervalCounter} Successful Intervals`));
                    } else {
                        console.log(colors.red(`            [${dateStr}] ${trader.name} Time Left: ${timeUntilReset} // Is it Time: ${isTime} // Already Sent: ${alreadySent.has(trader.name)} // ${intervalCounter} Successful Intervals`));
                    }
                }       

                //const timemessage = `${trader.name} restock <t:${first_ten}:R>`;
                
                if (timeUntilReset < 360000 && timeUntilReset > 0) { // If reset time is less than 5 minutes away

                    if (!alreadySent.has(trader.name)) {
                        //console.log(`${trader.name} Time Left: ${timeUntilReset}`);
                        alreadySent.set(trader.name, true); // mark message as sent
                
                        const guild = client.guilds.cache.get(config.bot.traderreset.guildID);
                        const role = guild.roles.cache.find(role => role.name.toLowerCase().includes(trader.name.toLowerCase()));
                
                        if (!role) {
                            console.log(`Could not find a role containing ${trader.name}. Skipping message send.`);
                            return;
                        }
                
                        // Send an embed
                        const Embd = Embed({
                            title:
                                phrases.bot.tr.resetTime.embedTitle[config.language]
                                    .replace(`{tradername}`, trader.name),
                            message:
                                phrases.bot.tr.resetTime.embedMessage[config.language]
                                    .replace(`{tradername}`, trader.name)
                                    .replace(`{epochnumbers}`, first_ten),
                            thumbnail: trader.imageLink
                        })
                        const traderChannel = client.channels.cache.get(config.bot.traderreset.discordChannel)
                        traderChannel.send({content:`<@&${role.id}>\n`, embeds: [Embd]})
                            .then(message => {
                                setTimeout(() => {
                                    message.delete();
                                    alreadySent.delete(trader.name);
                                }, 10 * 60 * 1000); // delete message after 10 minutes
                            });
                        }
                    }
                }, 10000 * i);
        });
    }

    async function Main() {
        try {
            await updateTraders();

            setInterval(async () => {
    
                intervalCounter++; // increment interval counter
    
                await tradersForEach();
    
                await updateTraders();
            }, 80000); 
        } catch (error) {
          if (error.name === "EAI_AGAIN") {
            console.error("Error: EAI_AGAIN occurred. Retrying in 15 minutes...");
            await new Promise(resolve => setTimeout(resolve, 900000)); // wait for 15 minutes
            await Main(); // call the function again recursively
          } else {
            console.error(error); // log the error for other types of errors
          }
        }
    }

    await Main();
    }
}