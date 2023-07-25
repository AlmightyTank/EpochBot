const config = {
    language: "en", // Language phrase, please make sure the language exists!

    api: {
        /* Please note that the current API routes AREN'T PROTECTED!
           Please do not enable the API unless you use it! */
        enabled: false,
        ip: "locahost",
        port: 6000
    },

    logging: {
        discordChannel: "1093613654387195996", // Channel id / NULL
        console: true, // If the process should log to the console too
        mysql: true, // Log mysql queries
        invites: true, // Log the Invites System
        xp: true // Log the XP System
    },

    ranks: {
        discordChannel: "972229559686676483", // Channel id / NULL
    },

    bot: {
        status: {
            /*
                @members
                @channels
                @guilds
            */
            text: ":D | [{members}] Members",
            type: "WATCHING"
        },
        embedSettings: {
            // Default embed values!
            color: "#54d6a2",
            footerText: "EpochBot#0423",
            footerIcon: "https://cdn.discordapp.com/avatars/1070167154764283974/d30756ddedb6c951ae43953a5a48d975.webp"
        },
        dev: {
            enabled: false,                  // true = enabled, false = disabled
            guildId: "972229559233695814",  // The Guild where you want to commands only work in, during this time
            clients: ["613545019663712261"] // The clients that can use the bot during this time
        },
        main: {

        },
        xp: {
            enabled: false,              // true = Enable the XP System / false = Disable the XP System
        },
        invitelinks: {
            enabled: true,
            discord: {
                modRole: '972229559338553354',
                adminRole: '972229559317573681',
                votingChannel: '1099931765948305518',
                handoutChannel: '972229559862849566'
            },
        },
        maps: {
            enabled: true,
        },
        traderreset: {
            enabled: true,
            debug: {
                enabled: false,
                logs: false,
            },
            guildID: "972229559233695814",
            reactionEmoji: {
                requiredTask: "⬅️",
                requiredTaskEN: "arrow_left"
            },
            discordChannel: "1091776415617273907", // Channel id / NULL
        },
        itemPrices: {
            enabled: true,
            guildID: "972229559233695814",
            discordChannel: "1118279162751356989", // Channel id / NULL
            debug: {
                enabled: true,
            },
        },
        invites: {
            enabled: true,
            stackRoles: false, // remove all roles when someone raise
            commands: {
                top: {
                    limit: 10
                }
            },
            levels: {
                1: {
                    role: '1079560111124660316'
                },
                3: {
                    role: '1079560862907498627'
                },
                5: {
                    role: '1079560923443900416'
                },
                7: {
                    role: '1079561016825892914'
                },
                10: {
                    role: '1079561165753036820'
                }
            }
        },
    },

    // DB Tables Name
    mysql: {
        tables: { // Tables Name
            xp: "EXP", // Please Change The Create Table Query Too!
            invites: "Invites", // Please Change The Create Table Query Too!
            maps: "Maps", // Please Change The Create Table Query Too!
            invitelinks: "InviteLinks" // Please Change The Create Table Query Too!
        },
        queries: { // Create Table Queries
            xp: "CREATE TABLE IF NOT EXISTS EXP (`guildId` VARCHAR(30) NOT NULL, `userId` VARCHAR(30) NOT NULL, `amount` INT(11) NOT NULL, `level` INT(5) NOT NULL, UNIQUE (`userId`)) ENGINE = INNODB",
            invites: "CREATE TABLE IF NOT EXISTS Invites ( `id` INT NOT NULL AUTO_INCREMENT , `guildId` TEXT NOT NULL , `inviterId` TEXT NOT NULL , `invitedId` TEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = INNODB",
            maps: "CREATE TABLE IF NOT EXISTS Maps ( `maps` TEXT NOT NULL , PRIMARY KEY (`maps`)) ENGINE = INNODB",
            invitelinks: "CREATE TABLE IF NOT EXISTS Invites ( `id` INT NOT NULL AUTO_INCREMENT, `guildId` VARCHAR(255) NOT NULL, `user_id` VARCHAR(255) NOT NULL, `amount` INT NOT NULL DEFAULT 0, PRIMARY KEY (id)) ENGINE=InnoDB"
        }
    }
}

export default config