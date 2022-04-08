import { player } from "../..";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { QueueRepeatMode } from "../../Typings/queue";

export default new Command({
    name: "clear",
    description: "Removes all tracks from the queue",
    permissions: "ManageQueue",
    voiceChannel: true,
    run: ({ interaction }) => {
        const queue = player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        if(interaction.member.voice.channel.id != interaction.guild.me.voice.channel.id){
            queue.connect(interaction.member.voice.channel);
        }
        
        interaction.followUp({ embeds: [Embed("Cleared Queue", 1)] });

        queue.Clear();
    }
})