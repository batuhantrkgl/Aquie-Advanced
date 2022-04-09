import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("guildCreate",(guild) => {
    console.log(`${guild.name}Bir Sunucuya Eklendi.`);
    client.db.addGuild(guild.id);
    client.registerCommands(guild);
})