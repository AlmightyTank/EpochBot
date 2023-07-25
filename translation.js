export default {
    bot: {
        main: {
            error: {
                en: "Error!",
                he: "שגיאה!"
            }
        },
        tr: {
            resetTime: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{tradername} Stock Reset!",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "{tradername}'s restocks - <t:{epochnumbers}:R>\n\`\`\`Use ❤️ to recieve Alerts, and \nUse 💔 to stop Alerts\`\`\`",
                    he: "{message}",
                }
            },
        },
        it: {
            itemgoingup: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{item} is going to the moon!",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "**Going** for **{itemPrice} RUB** - <t:{firstten}:R>",
                    he: "{message}",
                }
            },
            itemgoingdown: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{item} is going to the dirt!",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "**Going** for **{itemPrice} RUB** - <t:{firstten}:R>",
                    he: "{message}",
                }
            },
        },
        epoch: {
            timedone: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{username} Time Converter",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "{message}",
                    he: "{message}",
                }
            },
        },
        goonsTracker: {
            current: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{username} Goons Tracker",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "{current}",
                    he: "{current}",
                },
                error: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching data for Goons Tracker.",
                    he: ""
                }
            },
        },
        bandage: {
            message: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{username} Event Tracker for {name} Event",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "{current}",
                    he: "{current}",
                },
                error: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching data for Events Tracker.",
                    he: ""
                }
            },
        },
        questInfo: {
            task: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "Task Lookup: {taskname}",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "**Trader**: {tradername}\n**Description**:\n{obj}\n**Map**: {mapname}\n**Task Requirements**:\n{taskRequirements}\n**Needed Keys**: {needkeys}\n**Minimum LvL**: {minplayerlvl}\n**Kappa Required**: {kappareq}\n**LightKeeper Required**: {keeperReq}\n\n**Source**: {wikilink}",
                    he: "{message}",
                },
                noMap: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "none.",
                    he: ""
                },
                noKeys: {
                    // If there isn't any role for the new level, write that instead
                    en: "none.",
                    he: ""
                },
                noTask: {
                    // If there isn't any role for the new level, write that instead
                    en: "I'm sorry, I could not find a task with the name {taskName}",
                    he: ""
                },
                noRequirements: {
                    // If there isn't any role for the new level, write that instead
                    en: "none.",
                    he: ""
                },
                error: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching task information",
                    he: ""
                }
            },
        },
        mapsInfo: {
            map: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "Map Lookup: {mapname}",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "**Description**:\n{description}\n\n**Raid Duration**: {raidtime} minutes\n**Players**: {players}\n{enemy}\n\n**Source**: {wikilink}",
                    he: "{message}",
                },
                noMap: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, I could not find a map with the name {mapName}.",
                    he: ""
                },
                error: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching map information",
                    he: ""
                }
            },
        },
        itemInfo: {
            item: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "Item Lookup: {itemname}",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "**Description**:\n{obj}\n\n**Trader Pays**:\n {vendorPrices}\n\n**Last Lowest Price**: {lowprice}\n**Lowest Price in the Last 24H**: {low24h}\n**Highest Price in the Last 24H**: {high24h}\n**What was the change in the Past 48Hrs**: {last48h} ({last48hP})\n**Is it Used in a Task**: {usedintask}\n**Is it Received from a Task**: {receivedFromTasks}{crabat}\n\n**Source**: {wikilink}",
                    he: "{message}",
                },
                craftsUsing: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Crafts Using:",
                    he: ""
                },
                craftsFor: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Crafts For:",
                    he: ""
                },
                bartersUsing: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Bartars Using:",
                    he: ""
                },
                bartersFor: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Bartars For:",
                    he: ""
                },
                notFinditem: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, I could not find a item with the name {obj}",
                    he: ""
                },
                suggestioncf: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "to find out if you can craft it.",
                    he: ""
                },
                suggestionbf: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "to find out if you can barter for it.",
                    he: ""
                },
                suggestioncu: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "to find out what crafts uses this item.",
                    he: ""
                },
                suggestionbu: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "to find out what barter uses this item.",
                    he: ""
                },
                task: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "task",
                    he: ""
                },
                tasks: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "tasks",
                    he: ""
                },
                messagesugg: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "\n\n**Use this {randomMessage} \`\`\`/item item-name:{itemName} crabat:{randomString}\`\`\`**",
                    he: ""
                },
                fetchingitem: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching item information",
                    he: ""
                },
                noCrafts: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, There are no crafts for {itemName}",
                    he: ""
                },
                noBarter: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, There are no barters for {itemName}",
                    he: ""
                },
            },
        },
        ammoInfo: {
            item: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "Ammo Lookup: {itemname}",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "**Damage**: {damage}\n**Pen**: {penetrationPower}\n**Armor Damage**: {armorDamage}\n\n**Prices**:\n{vendorPrices}\n\n{distance}**Frag Chance**: {fragmentationChance}\n**Pen Chance**: {penetrationChance}\n**Ricochet Chance**: {ricochetChance}\n\n**Is it a Tracer**: {tracer}\n**Accuracy Modifier**: {accuracyModifier}\n**Recoil Modifier**: {recoilModifier}\n\n**Heavy Bleed Chance**: {heavyBleedModifier}\n**Light Bleed Chance**: {lightBleedModifier}\n{projectileCount}\n**Source**: {wikilink}",
                    he: "{message}",
                },
                noAmmo1: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, I could not find a ammo with the name {ammoName} 1",
                    he: ""
                },
                noAmmo2: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, I could not find a ammo with the name {ammoName} 2",
                    he: ""
                },
                noTraders: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Not sold by Traders.",
                    he: ""
                },
                projCount: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Projectile Count",
                    he: ""
                },
                error: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching item information",
                    he: ""
                }
            },
        },
        tarkovtime: {
            time: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{username} Tarkov Time",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "Left Time: **{left}**\nRight Time: **{right}**\n\n**Source**: {link}",
                    he: "{message}",
                },
                error: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching data for Tarkov time.",
                    he: ""
                }
            },
        },
        hideoutInfo: {
            hideout: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "Hideout Lookup: {hideoutname} Lvl {hideoutlvl}",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "**Description**:\n{description}\n\n**Construction Time**: {conTime}{itemRequirements}{stationLevelRequirements}{skillRequirements}{traderRequirements}{bonuses}\n\n**Source**: {wikilink}",
                    he: "{message}",
                },
                bonuses: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Bonuses:",
                    he: ""
                },
                traderRequirements: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Trader Requirements:",
                    he: ""
                },
                skillRequirements: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Skill Requirements:",
                    he: ""
                },
                itemRequirements: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Item Requirements:",
                    he: ""
                },
                stationLevelRequirements: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "Station Level Requirements:",
                    he: ""
                },
                noitemReqs: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, I could not find a hideout module with the name {hideoutName}",
                    he: ""
                },
                noitemLvls: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, Please input a lvl for the hideout module",
                    he: ""
                },
                noitemNames: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "I'm sorry, Please input a name for the hideout module",
                    he: ""
                },
                error: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "An error occurred while fetching item information",
                    he: ""
                }
            },
        },
        rr: {
            raiseLevel: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "Gz! {user} gained a Invite Role!",
                    he: "Gz! {user} קיבל תפקיד תגובה!",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "\n\n**➜ Role:** {role}",
                    he: "\n\n**➜ Role:** {role}",
                },
                noBonus: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "none.",
                    he: ""
                },
                noRole: {
                    // If there isn't any role for the new level, write that instead
                    en: "none.",
                    he: ""
                }
            },
            lowerLevel: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "Gz! {user} lost a Reaction Role!",
                    he: "Gz! {user} איבד תפקיד תגובה!",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "\n\n**➜ Role:** {role}",
                    he: "\n\n**➜ Role:** {role}",
                },
                noBonus: {
                    // If there isn't any bonus for the new level, write that instead
                    en: "none.",
                    he: ""
                },
                noRole: {
                    // If there isn't any role for the new level, write that instead
                    en: "none.",
                    he: ""
                }
            },
        },
        whatmap: {
            map: {
                embedTitle: {
                    /*
                        @user = user tag
                        @level = new level
                    */
                    en: "{username} Map Roulette",
                    he: "",
                },
                embedMessage: {
                    /*
                        @user = user tag
                        @level = the user new level
                        @xp = the user new xp amount
                        @bonus = the given bonus with the new level
                        @role = the given role with the new level
                    */
                    en: "We have selected: **{map}**, Hope you make it alive!!",
                    he: "**{message}**",
                }
            },
        },
        commands: {
            help: {
                description: {
                    en: "Shows useful commands",
                    he: "מציג פקודות שימושיות"
                },
                commands: {
                    en: "Usefull Commands:",
                    he: "פקודות שימושיות:"
                }
            },
            tarkovTime: {
                description: {
                    en: "To find out what time it is in Tarkov",
                    he: "מציג פקודות שימושיות"
                },
            },
            invitelink: {
                description: {
                    en: "To get an invite link",
                    he: "מציג פקודות שימושיות"
                },
            },
            questInfo: {
                description: {
                    en: "Get information about a task",
                    he: "מציג פקודות שימושיות"
                },
            },
            goonsTracker: {
                description: {
                    en: "Get information about the Goons",
                    he: "מציג פקודות שימושיות"
                },
            },
            bandage: {
                description: {
                    en: "Get information about the current and past events",
                    he: "מציג פקודות שימושיות"
                },
            },
            mapsInfo: {
                description: {
                    en: "Get information about a map",
                    he: "מציג פקודות שימושיות"
                },
            },
            itemInfo: {
                description: {
                    en: "Get information about an item",
                    he: "מציג פקודות שימושיות"
                },
            },
            ammoInfo: {
                description: {
                    en: "Get information about an ammo",
                    he: "מציג פקודות שימושיות"
                },
            },
            hideoutInfo: {
                description: {
                    en: "Get information about a Hideout Module",
                    he: "מציג פקודות שימושיות"
                },
            },
            craftInfo: {
                description: {
                    en: "Get information about an crafts",
                    he: "מציג פקודות שימושיות"
                },
            },
            whatmap: {
                description: {
                    en: "To help select maps for indecisive people",
                    he: "מציג את המשתמשים בעלי הכי הרבה הזמנות"
                },
                command: {
                    en: "Command",
                    he: "משתמש"
                },
                map: {
                    en: "Map",
                    he: "הזמנות"
                }
            },
            epoch: {
                description: {
                    en: "To help convert time to Epoch",
                    he: "מציג את המשתמשים בעלי הכי הרבה הזמנות"
                },
                date: {
                    en: "Date",
                    he: "משתמש"
                },
                time: {
                    en: "Time",
                    he: "הזמנות"
                },
                timezone: {
                    en: "Timezone",
                    he: "הזמנות"
                }
            }
        }
    },
    api: {

    }
}