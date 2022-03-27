import { client } from "../..";
import { Event } from "../../Structures/Event";
import { DBGuild } from "../../typings/database";

export default new Event("ready",async() => {
    client.log("Ready");

    //Register Commands
    const servers: string[] = [];
    client.guilds.cache.forEach(async guild => {
        client.registerCommands(guild);
        client.log(`Commands Registered in ${guild.name}`)
        //Database
        servers.push(guild.id);
        const dbGuild:DBGuild = await client.db.getGuild(guild.id);
        if(dbGuild != null) return;
        client.db.addGuild(guild.id);
    })

    client.db.Guilds().then((guilds) => {
        guilds.forEach(guild => {
            if(servers.includes(guild.guild_id)) return;
            client.db.removeGuild(guild.guild_id);
        }) 
    })
    

})