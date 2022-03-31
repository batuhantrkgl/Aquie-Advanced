import { player } from "../..";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "skip",
    description: "Skips to the next song",
    permissions: "ManagePlayer",
    voiceChannel: true,
    run: ({ interaction }) => {
        const queue = player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });
        interaction.followUp({ embeds: [Embed("Song Skipped", 1)] });
        queue.Skip();
    }
})