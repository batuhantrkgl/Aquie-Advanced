import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../..";
import { AutoComplete } from "../../Functions/autoComplete";
import { Event } from "../../Structures/Event";
import { CommandType, ExtendedInteraction } from "../../typings/client";

export default new Event("interactionCreate",async(interaction:ExtendedInteraction) => {
    if(interaction.isAutocomplete()) { AutoComplete(interaction); };
    if(!interaction.isCommand()) return;
    await interaction.deferReply({ fetchReply: true });

    const command:CommandType = client.commands.get(interaction.commandName);
    if(!command) return interaction.followUp({content: "This command no longer exists"}) && client.commands.delete(command.name);
    
    
    if(!await client.checkPermission(interaction.member, command)) {
        interaction.followUp({embeds: [
            {
                color: "WHITE",
                description: `❔** You do not have permission to \`\`${command.permissions}\`\`**`
            }
        ]})
        return;
    }
    try {
        command.run({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        })
    } catch(e) {
        console.log(e);
        return;
    }

})