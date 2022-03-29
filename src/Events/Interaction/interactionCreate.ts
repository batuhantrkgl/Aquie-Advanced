import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../..";
import { AutoComplete } from "../../Functions/autoComplete";
import { Embed } from "../../Functions/Embed";
import { Event } from "../../Structures/Event";
import { CommandType, ExtendedInteraction } from "../../Typings/client";

export default new Event("interactionCreate",async(interaction:ExtendedInteraction) => {
    if(interaction.isAutocomplete()) { AutoComplete(interaction); };
    if(!interaction.isCommand()) return;
    await interaction.deferReply({ fetchReply: true });

    const command:CommandType = client.commands.get(interaction.commandName);
    if(!command) return interaction.followUp({content: "This command no longer exists"}) && client.commands.delete(command.name);
    
    
    if(!await client.checkPermission(interaction.member, command.permissions)) {
        interaction.followUp({embeds: [Embed(`You do not have permission to \`\`${command.permissions}\`\``, 3)]});
        return;
    }

    if(command.voiceChannel) {
        if(!interaction.member.voice.channel) {
            interaction.followUp({embeds: [Embed("Connect to a Voice Channel", 2)]});
            return;
        }
        if(interaction.guild.me.voice.channel && interaction.guild.me.voice.channel.id !== interaction.member.voice.channel.id) {
            if(!(await client.checkPermission(interaction.member, "ManagePlayer"))) {
                interaction.followUp({embeds: [Embed(`To Use This Command, you must be on the same voice channel as the Bot.`, 3)]})
                return;
            };            
        }
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