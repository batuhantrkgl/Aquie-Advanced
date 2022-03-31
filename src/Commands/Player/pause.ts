import { player } from "../..";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";


export default new Command({
    name: "pause",
    description: "Pauses playback",
    permissions: "ManagePlayer",
    voiceChannel: true,
    run: ({ interaction }) => {
        const queue = player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        if(interaction.member.voice.channel.id != interaction.guild.me.voice.channel.id){
            queue.connect(interaction.member.voice.channel);
        }

        queue.Pause();

        interaction.followUp({embeds: [Embed("The song is on `paused`", 1)]});

    }
})