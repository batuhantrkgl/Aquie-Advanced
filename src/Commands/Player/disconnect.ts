import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "disconnect",
    description: "Disconnects the bot from your voice channel and clears the queue",
    permissions: "ManagePlayer",
    voiceChannel: true,
    run: ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });
        interaction.followUp({embeds: [Embed("Bye.", 1)]});
        queue.Disconnect();
    }
})