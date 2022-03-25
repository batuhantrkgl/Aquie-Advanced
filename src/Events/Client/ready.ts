import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("ready",() => {
    client.log("Ready");

    //Bot Presence
    client.user.setActivity({name: "137", type: "LISTENING"});
    client.user.setStatus("dnd");

    //Register Commands
    client.guilds.cache.forEach(guild => {
        client.registerCommands(guild);
        client.log(`Commands Registered in ${guild.name}`)
    })
    

})