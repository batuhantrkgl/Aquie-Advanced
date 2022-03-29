import { AquieClient } from "./Structures/Client";
import "dotenv/config";
import { Player } from "./Structures/Player";

export const client = new AquieClient({
    intents: 129,
    token: process.env.TOKEN,
    presence: {activities: [{name: "137", type: "LISTENING"}], status: "dnd"}
});

export const player = new Player(client);



client.Run();