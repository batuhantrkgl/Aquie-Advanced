const { Client } = require("discord-rpc");
const fetch = require("node-fetch");
require("dotenv").config();

const client = new Client({"transport": "ipc"});

/**
 * 
 * @returns {number} Returns the Total Number of Guilds
 */
async function getGuildSize() {
    const responseURL = "https://discord.com/api/v9/users/@me/guilds";

    const response = await fetch(responseURL, {
        method: "GET",
        headers: {
            Authorization: `Bot ${process.env.TOKEN}`
        }
    })

    const guilds = await response.json();
    
    return guilds.length;
}

/**
 * @returns {Promise<import("discord-rpc").Presence>}
 */
async function Activity() {
    const activity = {
        "details": "Queue register Single Music Bot",
        "state": `${(await getGuildSize()).toString()} servers`,
        "buttons": [
            {
                "label": "Invite",
                "url": process.env.INVITE_LINK
            },
            {
                "label": "Support",
                "url": process.env.GUILD
            }
        ],
        "largeImageKey": "avatar",
        "largeImageText": "Aquie"
    }

    return activity;
}


client.on("ready",async() => {
    console.log("RPC READY!");

    client.setActivity(await Activity()).catch();
    
    setInterval(async() => {
        await client.setActivity(await Activity()).catch();
    }, 30 * 10000);
});

client.login({ clientId: process.env.RPC_CLIENT_ID });
