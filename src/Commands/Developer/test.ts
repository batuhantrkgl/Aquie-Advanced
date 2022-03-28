import { Role } from "discord.js";
import { client } from "../..";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "test",
    description: "Test Command",
    permissions: "AddToQueue",
    options: [
        {
            name: "role",
            description: "açıklama",
            type: "ROLE",
            required: false
        }
    ],
    run: async({ interaction }) => {
        
        interaction.followUp({content: "Test!"});

        
        
    }
})