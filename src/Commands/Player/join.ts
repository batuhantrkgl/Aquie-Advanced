import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { Queue } from "../../Structures/Queue";

export default new Command({
    name: "join",
    description: "Connects to Voice Channel",
    permissions: "ManagePlayer",
    voiceChannel:true,
    run: ({ interaction }) =>{

        let queue:Queue = interaction.client.player.getQueue(interaction.guild);
        if(queue == null) queue = interaction.client.player.createQueue(interaction.guild, {
            textChannel: interaction.channel
        });
        interaction.followUp({embeds: [Embed(`Connected to Channel  \`\` ${interaction.member.voice.channel.name} \`\``, 1)]});
        queue.connect(interaction.member.voice.channel);
        
    }
})