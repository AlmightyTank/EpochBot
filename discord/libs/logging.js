import config from '../../config.js'
import { client } from '../../index.js'
import Embed from './embed.js'
import chalk from 'chalk'

export default async ({title, text, type = 'log'}) => {

    let logChannel = client.channels.cache.get(config.logging.discordChannel)

    config.logging.discordChannel &&
        typeof logChannel !== 'undefined' &&
            logChannel.send({ embeds: [
                Embed({
                    title: `[LOG] ${title}`,
                    color: "RED",
                    message: `**Log:** \`\`\`${JSON.stringify(text)}\`\`\``
                })
            ]})

    config.logging.console &&
        type == 'log' ?
            console.log(chalk.green(`[LOG] ${title}:`), text) :
                type = 'debug' ? console.log(chalk.blue(`[DEBUG] ${title}:`), text) :
                    type = 'error' && console.log(chalk.red(`[ERROR] ${title}:`), text)
}