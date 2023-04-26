// Import Packages
import { Collection } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import dotenv from 'dotenv'
import { readdirSync } from 'fs'
import colors from 'chalk'

// Import Config & Init
import { client } from '../../index.js'
import config from '../../config.js'

client.commands = new Collection()

dotenv.config()

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN)

const commands = []
const commandFiles = readdirSync('./discord/commands/').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	try {
		let command = await import(`../commands/${file}`)
		let cmd = command.default
		commands.push(cmd.register())
		client.commands.set(cmd.name, cmd)
		//console.log(colors.magenta(`- Loaded Command: ${cmd.name} (${cmd.description})`))
	} catch (error) {
		console.log(error)
	}
}

(async () => {
	try {
		//console.log(colors.cyan('& Reloading application commands.'))

		config.bot.dev.enabled ?
			await rest.put(Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, config.bot.dev.guildId), { body: commands })
		:
			await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID), { body: commands })

		//console.log(colors.green('> Successfully registered application commands.'))
	} catch (error) {
		console.error(error)
	}
})()

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName)

	if (!command) return;

	if(config.bot.dev.enabled)
		if(!config.bot.dev.clients.includes(interaction.user.id))
			return console.log('someone tried to use the bot at the development process.')

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
	}
})