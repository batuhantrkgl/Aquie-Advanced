import { player } from "../..";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { QueueRepeatMode } from "../../Typings/queue";

export default new Command({
    name: "skip",
    description: "Skips to the next song",
    permissions: "ManagePlayer",
    voiceChannel: true,
    run: ({ interaction }) => {
        const queue = player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        if(interaction.member.voice.channel.id != interaction.guild.me.voice.channel.id){
            queue.connect(interaction.member.voice.channel);
        }
        
        interaction.followUp({ embeds: [Embed("Song Skipped", 1)] });

        if(queue.repeatMode == QueueRepeatMode.Track) {
            queue.setRepeatMode(QueueRepeatMode.Default);
            queue.Skip();
            setTimeout(() => {
                queue.setRepeatMode(QueueRepeatMode.Track);
            }, 500)
           
            return;
        }

        queue.Skip();

    }
})