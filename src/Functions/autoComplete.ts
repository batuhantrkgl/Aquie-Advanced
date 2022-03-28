import { client } from "..";
import { ExtendedInteraction } from "../typings/client";

export const AutoComplete = (interaction:ExtendedInteraction): void => {
    const command = client.commands.get(interaction.commandName);
    if(!command.Autocomplete) return;
    command.Autocomplete(interaction);  
}