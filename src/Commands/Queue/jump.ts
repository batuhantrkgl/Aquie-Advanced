import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { QueueRepeatMode } from "../../typings/queue";

export default new Command({
    name: "jump",
    description: "Skips to the specified track",
    permissions: "ManagePlayer",
    voiceChannel: true,
    options: [
        {
            name: "position",
            description: "Select a position",
            type: "NUMBER",
            required: true
        }
    ],
    run: ({ interaction }) => {
        const index = interaction.options.getNumber("position");
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        if(interaction.member.voice.channel.id != interaction.guild.me.voice.channel.id){
            queue.connect(interaction.member.voice.channel);
        }

        interaction.followUp({embeds: [Embed(`Jumped to  \`\`${index}\`\``, 1)]});

        if(queue.repeatMode == QueueRepeatMode.Track) {
            queue.setRepeatMode(QueueRepeatMode.Default);
            queue.Jump(index);
            setTimeout(() => {
                queue.setRepeatMode(QueueRepeatMode.Track);
            }, 500)
           
            return;
        }


        queue.Jump(index);

        
    }

})