import { TextChannel } from "discord.js";
import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("guildDelete",(guild) => {
    client.db.removeGuild(guild.id);
    const channel = guild.client.channels.cache.get("964918354311802961") as TextChannel;

    channel?.send({embeds: [{
        title: "Server Removed",
        description: `\`(${guild.id})\` | ${guild.memberCount}`,
        color: "DEFAULT",
        timestamp: Date.now()
    }]});

    if(client.player.queue.has(guild.id)) { client.player.queue.get(guild.id).Destroy(); }
})