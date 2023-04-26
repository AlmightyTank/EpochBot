import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../../config.js';
import phrases from '../../translation.js';
import Query from '../../functions/Query.js'
import Embed from '../libs/embed.js';
import { client } from '../../index.js'

export default {
  name: 'link',
  description: phrases.bot.commands.invitelink.description[config.language],

  register() {
    const data = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option => option.setName('name').setDescription('Their name').setRequired(true))
      .addStringOption(option => option.setName('info').setDescription('How do you know them').setRequired(true))
      
      .toJSON();
    return data;
  },

  async execute(interaction) {
    if(!config.bot.invitelinks.enabled) return;

    const Name = interaction.options.getString('name');
    const Info = interaction.options.getString('info');

    console.log(`${Name} - ${Info}`);

    if (!Name == "" && !Info == "") {
      const name = Name;
      const relationship = Info;
      const userId = interaction.user.id;
        
      try {
        await interaction.reply('Your invite request has been sent to the admin channels for approval.');
          
        const adminChannel = client.channels.cache.get('1099931765948305518');
    
        const inviteMessage = await adminChannel.send(`New invite request from <@${interaction.user.id}> for ${name} (${relationship}) - Approve or reject this by reacting with 👍 or 👎`);
        await inviteMessage.react('👍');
        await inviteMessage.react('👎');

        await Query(`INSERT INTO ${config.mysql.tables.invitelinks} (name, relationship, user_id, message_id, approve_count, reject_count, approved) VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, relationship, userId, BigInt(inviteMessage.id), 0, 0, false]);

      } catch (err) {
        console.error(err);
        await interaction.reply('There was an error processing your invite request. Please try again later.');
      }
    }
  }
}
