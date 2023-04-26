import { SlashCommandBuilder } from '@discordjs/builders';
import phrases from '../../translation.js'
import config from '../../config.js'
import Embed from '../libs/embed.js'
import { request, gql } from 'graphql-request'
import { MessageReaction } from 'discord.js';
import fs from 'fs'

export default {
    name: 'ammo',
    description: phrases.bot.commands.ammoInfo.description[config.language],

	register() {
        const data = new SlashCommandBuilder()
		.setName(this.name)
		.setDescription(this.description)
        .addStringOption(option => option.setName('ammo-name').setDescription('The name of the ammo').setRequired(true))

        .toJSON()
        return data
    },   
    
    async execute(interaction) {
        const AMMO_FILE = 'ammo.json';
        let ammoData = [];
        try {
            if (fs.existsSync(AMMO_FILE)) {
                const data = fs.readFileSync(AMMO_FILE, 'utf8');
                ammoData = JSON.parse(data);
            } else {
                console.log(`No ${AMMO_FILE} file found.`);
            }
        } catch (err) {
            console.error(err);
        }

        let effectiveDistance = 0; 
        let maxHSDistance = 0;
    
        const ammoName = interaction.options.getString('ammo-name');
        const [ammoId] = ammoData.ammo.find(([id, name, shortname, effdis, maxhsdis]) => {
            const shortnameLower = shortname.toLowerCase();
            const ammoshortnameLower = ammoName.toLowerCase();
            const shortnameKeywords = shortnameLower.split(/\s+/);
            const ammoshortnameKeywords = ammoshortnameLower.split(/\s+/);

            effectiveDistance = effdis;
            maxHSDistance = maxhsdis;

            const nameLower = name.toLowerCase();
            const ammonameLower = ammoName.toLowerCase();
            const nameKeywords = nameLower.split(/\s+/);
            const ammoNameKeywords = ammonameLower.split(/\s+/);
          return ammoNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameLower.includes(ammonameLower) || ammoshortnameKeywords.every(keyword => shortnameKeywords.includes(keyword)) || shortnameLower.includes(ammoshortnameLower);
        }) || [];

        await interaction.deferReply();
     
        if (!ammoId) {
            return interaction.editReply(phrases.bot.ammoInfo.item.noAmmo1[config.language].replace(`{ammoName}`, ammoName));
        }
        try {
            const query = gql`
                {
                    ammo {
                    caliber
                    item {
                    id
                    name
                    wikiLink
                    iconLink
                    buyFor{
                        vendor{
                            name
                        }
                        price
                        currency
                    }
                    }
                    tracer
                    ammoType
                    projectileCount
                    damage
                    armorDamage
                    fragmentationChance
                    ricochetChance
                    penetrationPower
                    penetrationChance
                    accuracyModifier
                    recoilModifier
                    lightBleedModifier
                    heavyBleedModifier
                }
            }`;
    
            const data = await request('https://api.tarkov.dev/graphql', query);
    
            const ammo = data.ammo;

            //const selectedAmmo = ammo.find((ammo) => ammo.item.name.includes(ammoName));

            const selectedAmmo = ammo.find((ammo) => {
                const name = ammo.item.name;
                const nameLower = name.toLowerCase();
                const ammonameLower = ammoName.toLowerCase();
                const nameKeywords = nameLower.split(/\s+/);
                const ammoNameKeywords = ammonameLower.split(/\s+/);
                return ammoNameKeywords.every(keyword => nameKeywords.includes(keyword)) || nameLower.includes(ammonameLower);
              });

            if (!selectedAmmo) {
                return interaction.editReply(phrases.bot.ammoInfo.item.noAmmo2[config.language].replace(`{ammoName}`, ammoName));
            }

            const vendors = selectedAmmo.item.buyFor;
            const vendorPrices = [];
            vendors.forEach((vendor) => {
                if (vendor && vendor.vendor.name !== "Flea Market") {
                    vendorPrices.push(`${vendor.vendor.name}: **${vendor.price} ${vendor.currency}**`);
                }
            });
            let vendorPriceString = vendorPrices.join('\n');

            if (vendors.length < 1 || vendors === "[]") {
                vendorPriceString = phrases.bot.ammoInfo.item.noTraders[config.language]
            }

            const fragChance = selectedAmmo.fragmentationChance;
            const fragString = `${Math.abs(fragChance)}%`

            const penChance = selectedAmmo.penetrationChance;
            const penString = `${Math.abs(penChance)}%`

            const ricChance = selectedAmmo.ricochetChance;
            const ricString = `${Math.abs(ricChance)}%`

            const ligChance = selectedAmmo.lightBleedModifier;
            const ligString = `${Math.abs(ligChance)}%`

            const higChance = selectedAmmo.heavyBleedModifier;
            const higString = `${Math.abs(higChance)}%`

            const prejCount = selectedAmmo.projectileCount;
            let prejString = "";
            if (prejCount > 1) {
                prejString = `\n**${phrases.bot.ammoInfo.item.projCount[config.language]}**: ${prejCount}\n`;
            } else if (prejCount < 1) {
                prejString = "";
            }

            const iftracer = selectedAmmo.tracer;
            let tracerString = "";
            if (iftracer === false) {
                tracerString = "No.";
            } else if (iftracer === true) {
                tracerString = "Yes.";
            }

            let distance = "";
            if (effectiveDistance == 0 && maxHSDistance == 0) {

            } else if (effectiveDistance > 0 && maxHSDistance == 0) {
                distance = `**Effective Distance**: ${effectiveDistance} meters\n**Max Headshot Distance**: Never\n\n`;
            } else if (effectiveDistance && maxHSDistance == 0 || effectiveDistance && maxHSDistance > 999 || effectiveDistance > 999 && maxHSDistance) {
                distance = `**Effective Distance**: ${effectiveDistance} meters\n\n`;
            } else if (effectiveDistance == 0 && maxHSDistance) {
                distance = `**Max Headshot Distance**: ${maxHSDistance} meters\n\n`;
            } else if (effectiveDistance && maxHSDistance > 0) {
                distance = `**Effective Distance**: ${effectiveDistance} meters\n**Max Headshot Distance**: ${maxHSDistance} meters\n\n`;
            }
    
            const Embd = Embed({
                title:
                    phrases.bot.ammoInfo.item.embedTitle[config.language]
                        .replace(`{itemname}`, selectedAmmo.item.name),
                message:
                    phrases.bot.ammoInfo.item.embedMessage[config.language]
                        .replace(`{caliber}`, selectedAmmo.caliber)
                        .replace(`{tracer}`, tracerString)
                        .replace(`{ammoType}`, selectedAmmo.ammoType)
                        .replace(`{projectileCount}`, prejString)
                        .replace(`{damage}`, selectedAmmo.damage)
                        .replace(`{armorDamage}`, selectedAmmo.armorDamage)
                        .replace(`{fragmentationChance}`, fragString)
                        .replace(`{ricochetChance}`, ricString)
                        .replace(`{penetrationPower}`, selectedAmmo.penetrationPower)
                        .replace(`{penetrationChance}`, penString)
                        .replace(`{accuracyModifier}`, selectedAmmo.accuracyModifier)
                        .replace(`{recoilModifier}`, selectedAmmo.recoilModifier)
                        .replace(`{heavyBleedModifier}`, higString)
                        .replace(`{lightBleedModifier}`, ligString)
                        .replace(`{distance}`, distance)
                        .replace(`{vendorPrices}`, vendorPriceString)
                        .replace(`{wikilink}`, selectedAmmo.item.wikiLink),
                thumbnail: selectedAmmo.item.iconLink
            });
                
            //await interaction.deferReply();
                
            //await sleep(5000);
                    
            interaction.editReply({ embeds: [Embd] });
            
            } catch (error) {
                console.error(error);
                interaction.editReply(phrases.bot.ammoInfo.item.error[config.language]);
        }
    }
}