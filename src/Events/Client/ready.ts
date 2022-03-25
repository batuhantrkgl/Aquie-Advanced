import { client } from "../..";
import { Event } from "../../Structures/Event";

export default new Event("ready",() => {
    client.log("Ready");
})