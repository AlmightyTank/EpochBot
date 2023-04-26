import { Router } from 'express'
import { client } from '../../index.js'
import Query from '../../functions/Query.js'
import config from '../../config.js'
const router = Router()

export default router.get('/:action', async (req, res) => {
	switch(req.params.action) {
		case 'guilds':
		    res.status(200).json(client.guilds.cache)
		break

		case 'users':
		    res.status(200).json(client.users.cache)
		break

        case 'user': {
            // Get information about user, you must specift userId and guildId
            const { guildId, userId } = req.body
            if(!guildId || !userId) return res.status(400).json({ error: "You must specify 'userId' & 'guildId'."})

            const guild = await client.guilds.fetch(guildId)
            if(!guild) return res.status(400).json({ error: "Guild not found."})

            const member = await guild.members.fetch(userId)
            if(!member) return res.status(400).json({ error: "Member not found."})

            const invites = await Query(`SELECT * FROM ${config.mysql.tables.invites} WHERE inviterId = ? AND guildId = ?`, [userId, guildId])
            const xp = await Query(`SELECT * FROM ${config.mysql.tables.xp} WHERE userId = ? AND guildId = ?`, [userId, guildId])

            return res.status(200).json({ member, invites, xp })
        }

        case 'invites': {
            /* guildId, userId */
            const { guildId, userId } = req.body
            let invites
            if(guildId && userId)
                invites = await Query(`SELECT * FROM ${config.mysql.tables.invites} WHERE inviterId = ? AND guildId = ?`, [userId, guildId])
            else
                invites = await Query(`SELECT * FROM ${config.mysql.tables.invites}`)
            res.status(200).json(invites)
        }

        case 'xp': {
            /* guildId, userId */
            const { guildId, userId } = req.body
            let xp
            if(guildId && userId)
                xp = await Query(`SELECT * FROM ${config.mysql.tables.xp} WHERE userId = ? AND guildId = ?`, [userId, guildId])
            else
                xp = await Query(`SELECT * FROM ${config.mysql.tables.xp}`)
            res.status(200).json(xp)
        }
    
    }
})