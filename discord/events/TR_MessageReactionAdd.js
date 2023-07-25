import config from '../../config.js'
import TR_Ready from './TR_Ready.js'
import Embed from '../libs/embed.js'
import { client } from '../../index.js'
import Query from '../../functions/Query.js'
import phrases from '../../translation.js'
import colors from 'chalk'
import fs from 'fs'

export default {
    name: 'messageReactionAdd',
    async execute(reaction, user) {

      if(!config.bot.traderreset.enabled) return;
      if(user.id === "1070167154764283974") return;

        //console.log(`${reaction.emoji.name} - ${reaction.message.id}`);
        try {
          const heartEmoji = reaction.message.reactions.cache.find((r) => r.emoji.name === '❤️');
          const brokenheartEmoji = reaction.message.reactions.cache.find((r) => r.emoji.name === '💔');
              
          const heartCount = heartEmoji ? heartEmoji.count - 1 : 0;
          const brokenheartCount = brokenheartEmoji ? brokenheartEmoji.count - 1: 0;

          config.bot.traderreset.debug.enabled && console.log(`❤️: ${heartCount} - 💔: ${brokenheartCount}`);

          const alreadySent = TR_Ready.alreadySent;
          config.bot.traderreset.debug.enabled && console.log(alreadySent);

          if (heartCount > 0) {
            config.bot.traderreset.debug.enabled && console.log(`${reaction.message.channel.id} = ${reaction.message.channel.id === "1091776415617273907"}`);
            if(reaction.message.channel.id === "1091776415617273907") {
              config.bot.traderreset.debug.enabled && console.log(`${alreadySent.find(obj => obj.messageId === reaction.message.id)} - ${reaction.message.id}`);
              const found = alreadySent.find(obj => obj.messageId === reaction.message.id);
              if (found) {
                config.bot.traderreset.debug.enabled && console.log(found);
                const traderName = found.name; // Set the traderName variable to the trader.name of the matching entry
                const messageId = found.messageId; // Set the messageId variable to the message ID of the matching entry
                const guild = reaction.message.guild;
                const role = guild.roles.cache.find(role => role.name.toLowerCase().includes(traderName.toLowerCase()));
                if (role) {
                  const member = await guild.members.fetch(user.id);
                  await member.roles.add(role);
                  await reaction.users.remove(user);
                  //await reaction.react('❤️');
                } else {
                  console.log(`Couldn't find a role with ${traderName.toLowerCase()}`);
                }
              }      
            } else {
              console.log(colors.red(`            [=] We are not monitoring this channel: ${reaction.message.channel.name} - emoji: ${reaction.emoji.name} from ${user.tag} [Traders]`));
            }
          } else if (brokenheartCount > 0) {
            config.bot.traderreset.debug.enabled && console.log(`${reaction.message.channel.id} = ${reaction.message.channel.id === "1091776415617273907"}`);
            if(reaction.message.channel.id === "1091776415617273907") {
              config.bot.traderreset.debug.enabled && console.log(`${alreadySent.find(obj => obj.messageId === reaction.message.id)} - ${reaction.message.id}`);
              const found = alreadySent.find(obj => obj.messageId === reaction.message.id);
              if (found) {
                config.bot.traderreset.debug.enabled && console.log(found);
                const traderName = found.name; // Set the traderName variable to the trader.name of the matching entry
                const messageId = found.messageId;// Set the messageId variable to the message ID of the matching entry
                const guild = reaction.message.guild;
                const role = guild.roles.cache.find(role => role.name.toLowerCase().includes(traderName.toLowerCase()));
                config.bot.traderreset.debug.enabled && console.log(role.name);
                if (role) {
                  const member = await guild.members.fetch(user.id);
                  await member.roles.remove(role);
                  await reaction.users.remove(user);
                  //await reaction.react('💔');
                } else {
                  console.log(`Couldn't find a role with ${traderName.toLowerCase()}`);
                }
              }      
            } else {
              console.log(colors.red(`            [=] We are not monitoring this channel: ${reaction.message.channel.name} - emoji: ${reaction.emoji.name} from ${user.tag} [Traders]`));
            }
          } else {
            console.log(colors.red(`            [=] We are not monitoring this emoji: ${reaction.emoji.name} from ${user.tag} [Traders]`));
          }
        } catch (err) {
      console.error(err);
    }
  }	  
}