import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("guildCreate",(guild) => {
    client.db.addGuild(guild.id);
})