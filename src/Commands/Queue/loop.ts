import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { QueueRepeatMode } from "../../Typings/queue";

export default new Command({
    name: "loop",
    description: "Sets the repeat mode",
    type: "CHAT_INPUT",
    voiceChannel: true,
    permissions: "ManagePlayer",
    options: [
        {
            name: "type",
            description: "Select A Repeat Mode",
            type: "NUMBER",
            required: true,
            choices: [
                {
                    name: "Track",
                    value: QueueRepeatMode.Track
                },
                {
                    name: "Queue",
                    value: QueueRepeatMode.Queue
                },
                {
                    name: "Off",
                    value: QueueRepeatMode.Default
                }
            ]
        }
    ],
    run: ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        if(interaction.member.voice.channel.id != interaction.guild.me.voice.channel.id){
            queue.connect(interaction.member.voice.channel);
        }
        
        const mode = interaction.options.getNumber("type");
        queue.setRepeatMode(mode);
        let text:string;
        switch(mode){
            case QueueRepeatMode.Default:
                text = "Loop Off";
                break;
            case QueueRepeatMode.Track:
                text = "Track is looped";
                break;
            case QueueRepeatMode.Queue:
                text = "The queue is looped";
                break;
        }

        interaction.followUp({embeds: [Embed(text, 1)]});
    }
})