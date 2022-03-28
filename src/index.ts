import { AquieClient } from "./Structures/Client";
import "dotenv/config";

export const client = new AquieClient({
    intents: 129,
    token: process.env.TOKEN,
    presence: {activities: [{name: "137", type: "LISTENING"}], status: "dnd"}
});



client.Run();