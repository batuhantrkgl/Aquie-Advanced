import { TextChannel } from "discord.js";
import { Event } from "../../Structures/Event";
import { ExtendedGuild } from "../../Typings/client";

export default new Event("guildCreate",(guild: ExtendedGuild) => {
    const channel = guild.client.channels.cache.get("964918354311802961") as TextChannel;

    channel?.send({embeds: [{
        title: "Server Added",
        description: `\`(${guild.id})\` | ${guild.memberCount}`,
        color: "WHITE",
        timestamp: Date.now()
    }]});

    const welcomeChannel = guild.channels.cache.filter((channel) => channel.type == "GUILD_TEXT").first() as TextChannel;

    welcomeChannel?.send({embeds: [{
        description: "**🤍 I support the Slash command, you can use it by typing `/play`. I'm still in the demo version, so there may be errors in the commands, you can write `/help` for support..**",
        color:"WHITE"
    }]});

    guild.client.db.addGuild(guild.id);
    guild.client.registerCommands(guild);
})