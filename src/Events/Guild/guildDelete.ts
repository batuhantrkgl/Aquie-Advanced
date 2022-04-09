import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("guildDelete",(guild) => {
    client.db.removeGuild(guild.id);
    
})