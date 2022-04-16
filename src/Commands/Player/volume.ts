import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "volume",
    description: "Set volume",
    permissions: "ManagePlayer",
    voiceChannel: true,
    options: [
        {
            name: "volume",
            description: "new volume",
            type: "NUMBER",
            required: true
        }
    ],
    run: ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        const volume: number = interaction.options.getNumber("volume");

        if(volume > 100) {
            interaction.followUp({embeds: [Embed("The volume can be max \`100\`.", 2)]});
            return;
        }

        interaction.followUp({embeds: [Embed(`Updated volume : \`${volume}\``, 1)]});
        queue.setVolume(Math.floor(volume / 10));
    }
})