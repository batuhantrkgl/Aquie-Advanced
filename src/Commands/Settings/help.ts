import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "help",
    description: "To get help",
    voiceChannel: false,
    permissions: "Default",
    run: async ({ interaction }) => {
        await interaction.followUp({embeds: [Embed(`[Get Help](${interaction.client.guildInvite})`, 1)]});
    }
})