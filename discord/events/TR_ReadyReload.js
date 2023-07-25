// Import Packages
import colors from 'chalk'
import dotenv from 'dotenv'
import log from '../libs/logging.js'

//Constants for Twitch API Grabber
import fetch from 'node-fetch'

// Import Config & Init
import config from '../../config.js'
dotenv.config()

const targetUser = '1070167154764283974'; // Replace with the user ID you want to monitor
const targetChannel = '1091776415617273907'; // Replace with the channel ID you want to monitor

const messageTimers = new Map(); // Map to store messages and their timers  

export default {
	name: 'ready',
	once: true,

	async execute(client) {
    const channel = client.channels.cache.get(targetChannel);
  
    // Check for messages from the target user every time the bot starts or reconnects
    channel.messages.fetch({ limit: 10 }).then((messages) => {
      messages.forEach((message) => {
        if (message.author.id === targetUser) {
          startMessageTimer(message);
          console.log(colors.green(`            [=] TR Found Message - ${message.id}`))
        }
      });
    });
    
    function startMessageTimer(message) {
      const tenMinutes = 10 * 60 * 1000;
      const timeLeft = tenMinutes - (Date.now() - message.createdTimestamp);
    
      if (timeLeft <= 0) {
        removeMessage(message);
      } else {
        const timer = setTimeout(() => {
          removeMessage(message);
        }, timeLeft);
        messageTimers.set(message.id, timer);
      }
    }
    
    function removeMessage(message) {
      message.delete().catch(console.error);
      console.log(colors.green(`            [=] TR Deleted Message - ${message.id}`))
      messageTimers.delete(message.id);
    }

  }
}