import { player } from "../..";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { Queue } from "../../Structures/Queue";


export default new Command({
    name: "join",
    description: "Connects to Voice Channel",
    permissions: "ManagePlayer",
    voiceChannel:true,
    run: ({ interaction }) =>{

        let queue:Queue = player.getQueue(interaction.guild);
        if(queue == null) queue = player.createQueue(interaction.guild, {
            textChannel: interaction.channel
        });
        interaction.followUp({embeds: [Embed(`Connected to Channel  \`\` ${interaction.member.voice.channel.name} \`\``, 1)]});
        queue.connect(interaction.member.voice.channel);
        
    }
})