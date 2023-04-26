// Import Packages
import { readdirSync } from 'fs'

// Import Config & Init
import { client } from '../../index.js'

const eventFiles = readdirSync('./discord/events').filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
	let event = await import(`../events/${file}`)
	event = event.default
	if (event.once)
		client.once(event.name, (...args) => event.execute(...args))
	else
		client.on(event.name, (...args) => event.execute(...args))
}