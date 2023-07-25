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

const alreadySent = []; // create a new array to store the already sent messages

let intervalCounter = 0; // initialize interval counter

export default {
    name: 'ready',
    once: true,
    alreadySent,

    async execute(client) {
    if(!config.bot.traderreset.enabled) return;
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
        try {        
            traders.forEach(async (trader, i) => {

                setTimeout(async () => {

                    if (trader.name === 'Lightkeeper' || trader.name === 'Fence')
                        return

                    const resetTime = new Date(trader.resetTime)

                    const datestamp = Date.now()

                    const dateValTime = datestamp.valueOf()

                    const epochdateString = dateValTime.toString()
                    const first_ten_date = epochdateString.substring(0, 10)

                    const resetValTime = resetTime.valueOf()

                    const epochTimeString = resetValTime.toString()
                    const first_ten = epochTimeString.substring(0, 10)

                    const myDate = new Date(first_ten * 1000)

                    const nowDate = new Date(first_ten_date * 1000)

                    myDate.setHours(myDate.getHours() - 5)
                    nowDate.setHours(nowDate.getHours() - 5)

                    const timeUntilReset = myDate - nowDate

                    let isTime = false
                    if (timeUntilReset < 360000 && timeUntilReset > 0) {
                        isTime = true
                    } else {
                        isTime = false
                    }

                    const month = (nowDate.getMonth() + 1).toString().padStart(2, '0')
                    const date = nowDate.getDate().toString().padStart(2, '0')
                    const hours = nowDate.getHours().toString().padStart(2, '0')
                    const minutes = nowDate.getMinutes().toString().padStart(2, '0')
                    const seconds = nowDate.getSeconds().toString().padStart(2, '0')
                    const dateStr = `${nowDate.getFullYear()}/${month}/${date} ${hours}:${minutes}:${seconds}`

                    //const timemessage = `${trader.name} restock <t:${first_ten}:R>`;
                    if (timeUntilReset < 360000 && timeUntilReset > 0) { // If reset time is less than 5 minutes away
                        if (!alreadySent.some(obj => obj.name === trader.name)) {
                            //console.log(`${trader.name} Time Left: ${timeUntilReset}`);
                            //alreadySent.set(trader.name, true); // mark message as sent
                            //alreadySent.push(trader.name, true); // mark message as sent
                            const guild = client.guilds.cache.get(config.bot.traderreset.guildID)
                            const role = guild.roles.cache.find(role => role.name.toLowerCase().includes(trader.name.toLowerCase()))
                            const traderNow = trader.name.substring(0, 2) + 'Now';
                            const roleNow = guild.roles.cache.find(role => role.name.toLowerCase().includes(traderNow.toLowerCase()))

                            if (!role) {
                                console.log(`Could not find a role containing ${trader.name}. Skipping message send.`)
                                return;
                            }

                            // Send an embed
                            const Embd = Embed({
                                title: phrases.bot.tr.resetTime.embedTitle[config.language]
                                    .replace(`{tradername}`, trader.name),
                                message: phrases.bot.tr.resetTime.embedMessage[config.language]
                                    .replace(`{tradername}`, trader.name)
                                    .replace(`{epochnumbers}`, first_ten),
                                thumbnail: trader.imageLink
                            })
                            const traderChannel = client.channels.cache.get(config.bot.traderreset.discordChannel);
                            traderChannel.send({ content: `<@&${role.id}>\n`, embeds: [Embd] })
                                .then(async (message) => {
                                    await message.react('❤️');
                                    await message.react('💔');
                                    const found = alreadySent.find(obj => obj.name === trader.name);
                                    if (!found) {
                                        alreadySent.push({ name: trader.name, messageId: message.id, timeLeft: first_ten }) // mark message as sent
                                        const duration = timeUntilReset
                                        setTimeout(() => {
                                            const found = alreadySent.find(obj => obj.name === trader.name);
                                            const Embd = Embed({
                                                title: phrases.bot.tr.resetTime.embedTitle[config.language]
                                                    .replace(`{tradername}`, trader.name),
                                                message: phrases.bot.tr.resetTime.embedMessage[config.language]
                                                    .replace(`{tradername}`, trader.name)
                                                    .replace(`{epochnumbers}`, found.timeLeft),
                                                thumbnail: trader.imageLink
                                            })
                                            message.edit({ content: `<@&${role.id}>'s reset is happening NOW!! <@&${roleNow.id}>\n`, embeds: [Embd] })
                                                .then(async (message) => {
                                                    setTimeout(async () => {
                                                        const found = alreadySent.find(obj => obj.name === trader.name);
                                                        const Embd = Embed({
                                                            title: phrases.bot.tr.resetTime.embedTitle[config.language]
                                                                .replace(`{tradername}`, trader.name),
                                                            message: phrases.bot.tr.resetTime.embedMessage[config.language]
                                                                .replace(`{tradername}`, trader.name)
                                                                .replace(`{epochnumbers}`, found.timeLeft),
                                                            thumbnail: trader.imageLink
                                                        })
                                                        message.edit({ content: `<@&${role.id}>'s reset has happened 🤑\n`, embeds: [Embd] })
                                                    }, 60000)
                                                })
                                        }, duration)
                                    }
                                    config.bot.traderreset.debug.enabled && console.log(alreadySent)
                                    //alreadySent.set(trader.name, true, message.id); // mark message as sent
                                    setTimeout(async () => {
                                        await message.delete();
                                        //const index = alreadySent.indexOf(trader.name)
                                        //alreadySent.delete();
                                        //alreadySent.splice(index, 1)

                                        const indexToRemove = alreadySent.findIndex((element) => element.name === trader.name);
                                        config.bot.traderreset.debug.enabled && console.log(`${indexToRemove !== -1} || ${JSON.stringify(alreadySent[indexToRemove])} || ${alreadySent[indexToRemove].name === trader.name}`);
                                        if (indexToRemove !== -1 && alreadySent[indexToRemove].name === trader.name) {
                                            alreadySent.splice(indexToRemove, 1);
                                        }

                                        config.bot.traderreset.debug.enabled && console.log(alreadySent);
                                    }, 10 * 60 * 1000) // delete message after 10 minutes
                                })
                        }
                    }


                    if (!config.bot.traderreset.debug.logs) {
                        if (isTime === true) {
                            console.log(colors.green(`            [${dateStr}] ${trader.name.toString().padStart(11, ' ')} Time Left: ${timeUntilReset.toString().padStart(6, ' ')} // Is it Time: ${isTime.toString().padStart(5, ' ')} // Already Sent: ${(alreadySent.some(obj => obj.name === trader.name)).toString().padStart(5, ' ')} // ${intervalCounter.toString().padStart(2, ' ')} Successful Intervals`))
                        }
                    }

                    if (config.bot.traderreset.debug.logs) {
                        if (isTime === true) {
                            console.log(colors.green(`            [${dateStr}] ${trader.name.toString().padStart(11, ' ')} Time Left: ${timeUntilReset.toString().padStart(6, ' ')} // Is it Time: ${isTime.toString().padStart(5, ' ')} // Already Sent: ${(alreadySent.some(obj => obj.name === trader.name)).toString().padStart(5, ' ')} // ${intervalCounter.toString().padStart(2, ' ')} Successful Intervals`))
                        } else {
                            console.log(colors.red(`            [${dateStr}] ${trader.name.toString().padStart(11, ' ')} Time Left: ${timeUntilReset.toString().padStart(6, ' ')} // Is it Time: ${isTime.toString().padStart(5, ' ')} // Already Sent: ${(alreadySent.some(obj => obj.name === trader.name)).toString().padStart(5, ' ')} // ${intervalCounter.toString().padStart(2, ' ')} Successful Intervals`))
                        }
                    }

                }, 10000 * i)
            });
        } catch (error) {
            if ( error.type === 'system' && error.code === 'EAI_AGAIN') {
                console.log('DNS lookup failed. Retrying in 15 minutes...');
                await new Promise(resolve => setTimeout(resolve, 900000)); // wait for 15 minutes
                await Main(); // call the function again recursively
              } else {
                console.error(error); // log the error for other types of errors
            }
        }
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
            if (error && error.type === 'system' && error.code === 'EAI_AGAIN') {
                console.log('DNS lookup failed. Retrying in 15 minutes...');
                await new Promise(resolve => setTimeout(resolve, 900000)); // wait for 15 minutes
                await Main(); // call the function again recursively
            } else {
            console.error(error);
            }
        }
    }

    await Main();
    }
}