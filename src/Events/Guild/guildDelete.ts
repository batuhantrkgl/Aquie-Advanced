import { MessageEmbed, TextChannel } from "discord.js";
import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("guildDelete",async(guild) => {
    client.db.removeGuild(guild.id);
    const channel = guild.client.channels.cache.get("964918354311802961") as TextChannel;

    try {
        channel?.send({embeds: [
            new MessageEmbed()
            .setTitle("Server Removed")
            .setColor("NAVY")
            .addField("Member Count", guild.memberCount.toString(), true)
            .addField("Locale", guild.preferredLocale, true)
            .addField("Owner", (await guild.fetchOwner()).user.username, true)
            .setDescription(`> Login date <t:${Math.floor(guild.members.cache.get("960631151679139920")?.joinedTimestamp / 1000).toString()}:R>\n> Leave date <t:${Math.floor(Date.now() / 1000).toString()}:R>`)
        ]});
    } catch(e) {
        console.log(e);
        channel?.send("Logta hata var.");
    }
    

    if(client.player.queue.has(guild.id)) { client.player.queue.get(guild.id).Destroy(); }
})