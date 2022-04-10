import { Event } from "../../Structures/Event";
import { ExtendedGuild } from "../../Typings/client";

export default new Event("guildCreate",(guild: ExtendedGuild) => {
    console.log(`${guild.name} Sunucusuna Eklendi.`);
    guild.client.db.addGuild(guild.id);
    guild.client.registerCommands(guild);
})