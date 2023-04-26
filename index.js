// Import Packages
import { Client, Intents } from 'discord.js'
import { createPool } from 'mysql2'
import { readdirSync } from 'fs'
import dotenv from 'dotenv'
dotenv.config()

import config from './config.js'
import Query from './functions/Query.js'

// Init & Export Discord Client
export const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    ignoreSelf: false
})

// Import Commands & Events
import (`./discord/libs/commands.js`)
import (`./discord/libs/events.js`)

// Import Express App
import App from './API/server.js'

// Init & Export MySQL Connection
export const DB = createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
})

// Create XP & Invites Tables (Comment!)
//config.bot.xp.enabled && await Query(config.mysql.queries.xp)
config.bot.invitelinks.enabled && await Query(config.mysql.queries.invitelinks)
config.bot.invites.enabled && await Query(config.mysql.queries.invites)


// Generate & Export Bot Invite Link
export const InviteLink = `https://discord.com/oauth2/authorize?client_id=${process.env.BOT_CLIENT_ID}&permissions=${process.env.BOT_PERMISSIONS_HASH}&scope=${process.env.BOT_SCOPES.split(" ").join(`%20`)}`

export const eventFiles = readdirSync('./discord/events').filter(file => file.endsWith('.js'))

export const API = {
    status: 'OFFLINE'
}

if(config.api.enabled)
    try {
        App.listen(config.api.port || 5000)
        API.status = 'ONLINE'
    } catch (err) {
        console.log(err)
        API.status = 'ERRORED'
    }

client.login(process.env.BOT_TOKEN)