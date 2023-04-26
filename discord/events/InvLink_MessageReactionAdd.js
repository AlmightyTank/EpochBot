import config from '../../config.js'
import Embed from '../libs/embed.js'
import { client } from '../../index.js'
import Query from '../../functions/Query.js'
import phrases from '../../translation.js'
import colors from 'chalk'
import fs from 'fs'

export default {
    name: 'messageReactionAdd',
    async execute(reaction, user) {

      if(!config.bot.invitelinks.enabled) return;
      if(user.id === "1070167154764283974") return;

        //console.log(`${reaction.emoji.name} - ${reaction.message.id}`);
      
        try {
          if (reaction.emoji.name === '👍' || reaction.emoji.name === '👎') {
            if(reaction.message.channel.id === config.bot.invitelinks.discord.votingChannel) {
              const invite = await Query(`SELECT * FROM ${config.mysql.tables.invitelinks} WHERE message_id = ?`, [reaction.message.id]);
      
              if (!invite) {
                return;
              }
        
              const approveEmoji = reaction.message.reactions.cache.find((r) => r.emoji.name === '👍');
              const rejectEmoji = reaction.message.reactions.cache.find((r) => r.emoji.name === '👎');
              
              const approveCount = approveEmoji ? approveEmoji.count - 1 : 0;
              const rejectCount = rejectEmoji ? rejectEmoji.count - 1: 0;
    
              //console.log(`Approved: ${approveCount} Rejected: ${rejectCount}`);
        
              await Query(`UPDATE ${config.mysql.tables.invitelinks} SET approve_count = ?, reject_count = ? WHERE message_id = ?`, [approveCount, rejectCount, reaction.message.id]);
        
              const approvedCount = await Query(`SELECT COUNT(*) as count FROM ${config.mysql.tables.invitelinks} WHERE approved = false`);
    
              //console.log(approvedCount.results[0].count);
        
              if (approvedCount.results[0].count === 0) return;
    
              const invites = await Query(`SELECT * FROM ${config.mysql.tables.invitelinks} WHERE approved = false AND message_id = ?`, [reaction.message.id]);
    
              //console.log(invites.results);
      
              invites.results.forEach(async (invite) => {
                const modRole = reaction.message.guild.roles.cache.get(config.bot.invitelinks.discord.modRole);
                const adminRole = reaction.message.guild.roles.cache.get(config.bot.invitelinks.discord.adminRole);
    
                const membersWithModRole = modRole.members;
                const membersWithAdminRole = adminRole.members;
                const modCount = membersWithModRole.size;
                const adminCount = membersWithAdminRole.size;
    
                const combineCounts = Math.floor((modCount + adminCount) / 3);
    
                //console.log(combineCounts);
    
                console.log(colors.green(`            [=] Approved: ${invite.approve_count} - ${(invite.approve_count) >= combineCounts} - Rejected: ${invite.reject_count} - ${(invite.reject_count) >= combineCounts}`));
                if ((invite.approve_count) >= combineCounts) {
                  await Query(`UPDATE ${config.mysql.tables.invitelinks} SET approved = true WHERE message_id = ?`, [reaction.message.id]);
      
                  const inviteeDmChannel = await client.users.cache.get(invite.user_id);
                  const hangoutChannel = await client.channels.cache.get(config.bot.invitelinks.discord.handoutChannel);
    
                  const inviteLink = await hangoutChannel.createInvite({ maxAge: 86400, maxUses: 1, unique: true });
      
                  await inviteeDmChannel.send(`Here's your invite link for ${invite.name}: ${inviteLink}`);
    
                  client.channels.cache.get(config.bot.invitelinks.discord.votingChannel).messages.fetch(reaction.message.id)
                    .then(message => {
                      message.delete();
                    })
                    .catch(console.error);
      
                  const votingChannel = client.channels.cache.get(config.bot.invitelinks.discord.votingChannel);
      
                  await votingChannel.send(`Invite request for ${invite.name} from <@${invite.user_id}> has been approved - ${invite.approve_count} A/R ${invite.reject_count}\nRelationship: ${invite.relationship}`);
    
                  await Query(`DELETE FROM ${config.mysql.tables.invitelinks} WHERE approved = true AND user_id = ? AND message_id = ?`, [invite.user_id, reaction.message.id]);
    
                  let state = await Query(`SELECT amount FROM ${config.mysql.tables.invites} WHERE user_id = ? AND guildId = ?`, [invite.user_id, reaction.message.guild.id])
                  if(state.results.length < 1) { // User Doesn't Exist =>
                      await Query(`INSERT INTO ${config.mysql.tables.invites} (guildId, user_id) VALUES (?, ?)`, [reaction.message.guild.id, invite.user_id]);
                      state = await Query(`SELECT amount FROM ${config.mysql.tables.invites} WHERE user_id = ? AND guildId = ?`, [invite.user_id, reaction.message.guild.id])
                  }
                  // User Exist =>
                  state = state.results[0];
    
                  let updatedState = 1 + state.amount;
    
                  await Query(`UPDATE ${config.mysql.tables.invites} SET amount = ? WHERE user_id = ? AND guildId = ?`, [updatedState, invite.user_id, reaction.message.guild.id])
    
                  const Member = await reaction.message.guild.members.cache.find(member => member.id === invite.user_id)
    
                  if(config.bot.invites.levels[updatedState]?.role) {
                    if(!config.bot.invites.stackRoles)
                        for (const [key, value] of Object.entries(config.bot.invites.levels))
                            await Member.roles.remove(value.role)
                        
                  await Member.roles.add(config.bot.invites.levels[updatedState].role)
                  const guild = reaction.message.guild;
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
    
                  client.channels.cache.get(config.bot.invitelinks.discord.votingChannel).messages.fetch(reaction.message.id)
                    .then(message => {
                      message.delete();
                    })
                    .catch(console.error);
    
                  const votingChannel = client.channels.cache.get(config.bot.invitelinks.discord.votingChannel);
      
                  await votingChannel.send(`Invite request for ${invite.name} from <@${invite.user_id}> has been denied - ${invite.approve_count} A/R ${invite.reject_count}\nRelationship: ${invite.relationship}`);
      
                  await Query(`DELETE FROM ${config.mysql.tables.invitelinks} WHERE approved = false AND user_id = ? AND message_id = ?`, [invite.user_id, reaction.message.id]);
                  
                }
              });
            } else {
              console.log(colors.red(`            [=] We are not monitoring this channel - ${reaction.message.channel.name}`));
            }
          } else {
            console.log(colors.red(`            [=] We are not monitoring this emoji - ${reaction.emoji.name}`));
          }
        } catch (err) {
      console.error(err);
    }
  }	  
}