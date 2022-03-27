import { client } from "../..";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "test",
    description: "Test Command",
    permissions: "Default",
    run: async({ interaction }) => {
        interaction.followUp({content: "Test!"});

        
    }
})