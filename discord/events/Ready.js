// Import Packages
import colors from 'chalk'
import dotenv from 'dotenv'
import log from '../libs/logging.js'

//Constants for Twitch API Grabber
import fetch from 'node-fetch'
const twitchIDEndpoint = 'https://id.twitch.tv/oauth2/token';
const twitchAPIEndpoint = 'https://api.twitch.tv';
const streamers = [
    {
      name: 'streamer1',
      twitch_username: 'bakedbackhouse',
      live: false,
    },
    {
      name: 'streamer2',
      twitch_username: 'toastracktv',
      live: false,
    },
    {
      name: 'streamer3',
      twitch_username: 'almightytank',
      live: false,
    },
    {
      name: 'streamer4',
      twitch_username: 'verybadscav',
      live: false,
    },
    {
      name: 'streamer5',
      twitch_username: 'duskyreaper07',
      live: false,
    },
    {
      name: 'streamer6',
      twitch_username: 'airwingmarine',
      live: false,
    },
    {
      name: 'streamer7',
      twitch_username: 'jessekazam',
      live: false,
    },
];
  
let twitchAPIToken = '';

// Import Config & Init
import config from '../../config.js'
dotenv.config()

import { InviteLink, API , eventFiles} from '../../index.js'

export default {
	name: 'ready',
	once: true,

	async execute(client) {
		console.log(colors.cyan(`\n
            [=====================================]
            [=] Development Mode: ${config.bot.dev.enabled ? "ON" : "OFF"}

            [=] Logged In As: ${client.user.tag}
            [=] API: ${API.status} | http://${config.api.ip}:${config.api.port}
            [=] Loaded ${client.commands.size} Commands && ${eventFiles.length} Events

            [=] Statistics:
            > Users: ${client.users.cache.size}
            > Channels: ${client.channels.cache.size}
            > Servers: ${client.guilds.cache.size}

            [=] Invite Link: ${InviteLink}
            [=====================================]
        `))

        function getTwitchAPIToken() {
            const url = twitchIDEndpoint;
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
              })
            };
            fetch(url, options)
              .then(response => response.json())
              .then(data => {
                twitchAPIToken = data.access_token;
                console.log(colors.cyan(`            [LOG] Got Twitch API token: ${twitchAPIToken}`));
              })
              .catch(error => {
                console.error(`[ERROR] Error getting Twitch API token: ${error}`);
              });
        }

        // List of Activity that are picked at random when no one is live
        //Playing = 0, Streaming = 1, Listening to = 2, Watching = 3, Competing = 5
        const list = [
          { name: 'AlMightyTank#6286', number: 3 },
          { name: 'Myself get Lost', number: 3 },
          { name: 'Word of Wisdom', number: 2 },
          { name: 'with Tornados', number: 0 },
          { name: 'the Screams from Below', number: 2 },
          { name: 'the Fight for Life in Tarkov', number: 5 },
        ];

        // Define an array to store the previous picks
        const previousPicks = [];

        // Define a function that picks a random element from the list, along with its number, without repeating previous picks
        function pickRandomFromList(list, previousPicks) {
          let randomElement = null;
          while (!randomElement || previousPicks.includes(randomElement.name)) {
            const randomIndex = Math.floor(Math.random() * list.length);
            randomElement = list[randomIndex];
          }
          return { name: randomElement.name, number: randomElement.number };
        }
        
        // Define a function that picks a random element from the list, along with its number
        //function pickRandomFromList(list) {
        //  const randomIndex = Math.floor(Math.random() * list.length);
        //  const randomElement = list[randomIndex];
        //  return { name: randomElement.name, number: randomElement.number };
        //}
         
        function updateStatus(streamers) {
            const url = `${twitchAPIEndpoint}/helix/streams?user_login=${streamers}`;
            const options = {
              method: 'GET',
              headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${twitchAPIToken}`
              },
            };
            fetch(url, options)
              .then(response => {
                if (response.status === 401) {
                  console.log('[401] Twitch API token expired, refreshing...');
                  return getTwitchAPIToken().then(() => updateStatus(streamers));
                } else {
                  return response.json();
                }
              })
              .then(data => {
                const isLive = data.data.length > 0;
                if (isLive) {
                    const streamData = data.data[0];
                    const streamTitle = streamData.title;
                    const streamGame = streamData.game_name;
                    const streamerName = streamData.user_name;
                    const streamURL = `https://www.twitch.tv/${streamers}`;
                    //client.user.setActivity(`${streamers} is live!`, { type: "STREAMING", url: streamURL });
                    client.user.setActivity(`${streamerName} playing ${streamGame}!`, {
                        type: "STREAMING",
                        url: streamURL
                    });
                    client.user.setStatus("online");
                    //console.log(`[LOG] ${streamers} is live`)
                } else {
                    //const randomElement = pickRandomFromList(list);
                    const randomElement = pickRandomFromList(list, previousPicks);
                    previousPicks.push(randomElement.name);
                    client.user.setActivity(`${randomElement.name}`, { type: randomElement.number});
                    client.user.setStatus("online");
                    //console.log(`[LOG] ${streamers} is not live and picked ${randomElement.name} with ${previousPicks.length} previous picks`);
                    if(previousPicks.length > 5) {
                      previousPicks.splice(0, 1);
                    }
                }
              })
              .catch(error => {
                console.error(error);
              });
        }

        async function Main() {
          try {
            setInterval(() => {
              streamers.forEach((streamers, i) => {
                  setTimeout(() => {
                      //console.log(`[LOG] ${streamers.twitch_username}`);
                      updateStatus(streamers.twitch_username);
                  }, 60000 * i);
              });
          }, 60000 * (streamers.length + 1)); 
          } catch (error) {
            if (error.code === "EAI_AGAIN") {
              console.error("Error: EAI_AGAIN occurred. Retrying in 15 minutes...");
              await new Promise(resolve => setTimeout(resolve, 900000)); // wait for 15 minutes
              await Main(); // call the function again recursively
            } else {
              console.error(error); // log the error for other types of errors
            }
          }
        }

        getTwitchAPIToken();
        Main();
	}
}