import { MessageEmbed } from 'discord.js'
import config from '../../config.js'

const Embed = ({ title, message, thumbnail, color, footerText, footerIcon, fields }) => {

    color = color || config.bot.embedSettings.color
    footerText = footerText || config.bot.embedSettings.footerText
    footerIcon = footerIcon || config.bot.embedSettings.footerIcon

    const newEmbed = new MessageEmbed()
        title && newEmbed.setTitle(title)
        newEmbed.setColor(color)
        message && newEmbed.setDescription(message)
        thumbnail && newEmbed.setThumbnail(thumbnail)
        fields && newEmbed.addFields(fields)
        newEmbed.setFooter({text: footerText, iconURL: footerIcon})
        newEmbed.setTimestamp()
    return newEmbed

}

export default Embed