import { player } from "../..";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "back",
    description: "Skips to the previous song",
    permissions: "ManagePlayer",
    voiceChannel: true,
    run: ({ interaction }) => {
        const queue = player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });
        interaction.followUp({ embeds: [Embed("Back Skipped", 1)] });
        queue.Back();
    }
})