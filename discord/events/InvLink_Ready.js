// Import Packages
import config from '../../config.js'
import Embed from '../libs/embed.js'
import colors from 'chalk'
import dotenv from 'dotenv'
import Query from '../../functions/Query.js'
import fs from 'fs'
import log from '../libs/logging.js'

// Import Config & Init
dotenv.config()

export default {
    name: 'ready',
    once: true,

    async execute(client) {
        console.log(colors.green(`            [=] Loading Invite Links`));

        const channelId = '1099931765948305518'; // Replace with your channel ID
      
        Query(`SELECT message_id FROM ${config.mysql.tables.invitelinks}`, (error, results, fields) => {
          if (error) throw error;
          
          results.forEach(result => {
            //console.log(result);
            const messageId = BigInt(result.message_id);
            
            client.channels.fetch(channelId)
              .then(channel => {
                channel.messages.fetch(messageId)
                  .then(async message => {
                    console.log(colors.green(`            [=] Fetched message with ID ${messageId}`));
                    const approveEmoji = message.reactions.cache.find((r) => r.emoji.name === '👍');
                    const rejectEmoji = message.reactions.cache.find((r) => r.emoji.name === '👎');
                    
                    const approveCount = approveEmoji ? approveEmoji.count - 1 : 0;
                    const rejectCount = rejectEmoji ? rejectEmoji.count - 1: 0;
          
                    //console.log(`Approved: ${approveCount} Rejected: ${rejectCount}`);
              
                    await Query(`UPDATE ${config.mysql.tables.invitelinks} SET approve_count = ?, reject_count = ? WHERE message_id = ?`, [approveCount, rejectCount, message.id]);
              
                    const approvedCount = await Query(`SELECT COUNT(*) as count FROM ${config.mysql.tables.invitelinks} WHERE approved = false`);
          
                    //console.log(approvedCount.results[0].count);
              
                    if (approvedCount.results[0].count === 0) return;
          
                    const invites = await Query(`SELECT * FROM ${config.mysql.tables.invitelinks} WHERE approved = false AND message_id = ?`, [message.id]);
          
                    //console.log(invites.results);
            
                    invites.results.forEach(async (invite) => {
                      const modRole = message.guild.roles.cache.get(config.bot.invitelinks.discord.modRole);
                      const adminRole = message.guild.roles.cache.get(config.bot.invitelinks.discord.adminRole);
          
                      const membersWithModRole = modRole.members;
                      const membersWithAdminRole = adminRole.members;
                      const modCount = membersWithModRole.size;
                      const adminCount = membersWithAdminRole.size;
          
                      const combineCounts = Math.floor((modCount + adminCount) / 3);
          
                      //console.log(combineCounts);
          
                      console.log(colors.green(`            [=] Approved: ${invite.approve_count} - ${(invite.approve_count) >= combineCounts} - Rejected: ${invite.reject_count} - ${(invite.reject_count) >= combineCounts}`));
                      if ((invite.approve_count) >= combineCounts) {
                        await Query(`UPDATE ${config.mysql.tables.invitelinks} SET approved = true WHERE message_id = ?`, [message.id]);
            
                        const inviteeDmChannel = await client.users.cache.get(invite.user_id);
                        const hangoutChannel = client.channels.cache.get(config.bot.invitelinks.discord.handoutChannel);
          
                        const inviteLink = await hangoutChannel.createInvite({ maxAge: 86400, maxUses: 1, unique: true });
            
                        await inviteeDmChannel.send(`Here's your invite link for ${invite.name}: ${inviteLink}`);
          
                        client.channels.cache.get(config.bot.invitelinks.discord.votingChannel).messages.fetch(message.id)
                          .then(message => {
                            message.delete();
                          })
                          .catch(console.error);
            
                        const votingChannel = client.channels.cache.get(config.bot.invitelinks.discord.votingChannel);
            
                        await votingChannel.send(`Invite request for ${invite.name} from <@${invite.user_id}> has been approved - ${invite.approve_count} A/R ${invite.reject_count}\nRelationship: ${invite.relationship}`);
          
                        await Query(`DELETE FROM ${config.mysql.tables.invitelinks} WHERE approved = true AND user_id = ? AND message_id = ?`, [invite.user_id, message.id]);
          
                        let state = await Query(`SELECT amount FROM ${config.mysql.tables.invites} WHERE user_id = ? AND guildId = ?`, [invite.user_id, message.guild.id])
                        if(state.results.length < 1) { // User Doesn't Exist =>
                            await Query(`INSERT INTO ${config.mysql.tables.invites} (guildId, user_id) VALUES (?, ?)`, [message.guild.id, invite.user_id]);
                            state = await Query(`SELECT amount FROM ${config.mysql.tables.invites} WHERE user_id = ? AND guildId = ?`, [invite.user_id, message.guild.id])
                        }
                        // User Exist =>
                        state = state.results[0];
          
                        let updatedState = 1 + state.amount;
          
                        await Query(`UPDATE ${config.mysql.tables.invites} SET amount = ? WHERE user_id = ? AND guildId = ?`, [updatedState, invite.user_id, message.guild.id])
          
                        const Member = await message.guild.members.cache.find(member => member.id === invite.user_id)
          
                        if(config.bot.invites.levels[updatedState]?.role) {
                          if(!config.bot.invites.stackRoles)
                              for (const [key, value] of Object.entries(config.bot.invites.levels))
                                  await Member.roles.remove(value.role)
                              
                        await Member.roles.add(config.bot.invites.levels[updatedState].role)
                        const guild = message.guild;
                        const role = guild.roles.cache.get(config.bot.invites.levels[updatedState].role);
          
                        if(Member.roles.cache.has(config.bot.invites.levels[updatedState]?.role)) {
                          const Embd = Embed({
                              title:
                                  phrases.bot.rr.raiseLevel.embedTitle[config.language]
                                      .replace(`{user}`, Member.user.username),
                              message:
                                  phrases.bot.rr.raiseLevel.embedMessage[config.language]
                                      .replace(`{role}`, role),
                              thumbnail: Member.user.displayAvatarURL()
                          })
                          const ranksChannel = client.channels.cache.get(config.ranks.discordChannel)
                          const ranksMessage = await ranksChannel.send({embeds: [Embd]})
                          await ranksMessage.react('🔥');
                        }
                      }
                    } else if ((invite.reject_count) >= combineCounts) {
          
                      const inviteeDmChannel = await client.users.cache.get(invite.user_id);
                      await inviteeDmChannel.send(`Sorry, you're InviteLink request has been denied`);
          
                      client.channels.cache.get(config.bot.invitelinks.discord.votingChannel).messages.fetch(message.id)
                        .then(message => {
                          message.delete();
                        })
                        .catch(console.error);
          
                      const votingChannel = client.channels.cache.get(config.bot.invitelinks.discord.votingChannel);
          
                      await votingChannel.send(`Invite request for ${invite.name} from <@${invite.user_id}> has been denied - ${invite.approve_count} A/R ${invite.reject_count}\nRelationship: ${invite.relationship}`);
          
                      await Query(`DELETE FROM ${config.mysql.tables.invitelinks} WHERE approved = false AND user_id = ? AND message_id = ?`, [invite.user_id, message.id]);
                      
                    }
                  });
                  })
                  .catch(error => {
                    console.error(`Failed to fetch message with ID ${messageId}: ${error}`);
                  });
              })
              .catch(error => {
                console.error(`Failed to fetch channel with ID ${channelId}: ${error}`);
              });
          });
        });
    }
}