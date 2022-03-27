import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("ready",() => {
    client.log("Ready");

    //Register Commands
    client.guilds.cache.forEach(guild => {
        client.registerCommands(guild);
        client.log(`Commands Registered in ${guild.name}`)
    })
    

})