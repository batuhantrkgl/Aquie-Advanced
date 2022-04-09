import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "remove",
    description: "Deleting songs in the queue",
    permissions: "ManageQueue",
    voiceChannel: true,
    options: [
        {
            name: "track",
            description: "Removes the specified track from the queue",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "position",
                    description: "Track Position",
                    type: "NUMBER",
                    required: true
                }
            ]
        },
        {
            name: "range",
            description: "Removes the specified track range from the queue.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "start",
                    description: "Start Position",
                    type: "NUMBER",
                    required: true
                },
                {
                    name: "end",
                    description: "End Position",
                    type: "NUMBER",
                    required: true
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
        
        switch(interaction.options.getSubcommand()) {
            case "track":
                const trackIndex:number = interaction.options.getNumber("position") - 1;
                const track = queue.getTrack(trackIndex);
                if(!track) {
                    interaction.followUp({embeds: [Embed("There is no song in the Position you specified.", 3)]})
                    return;
                }
                queue.Remove(trackIndex);
                interaction.followUp({embeds: [Embed(`Removed \`\` ${track.title} \`\``, 1)]})
                return;
            case "range":
                const [startIndex, endIndex] = [interaction.options.getNumber("start") - 1, interaction.options.getNumber("end")];
                const startTrack = queue.getTrack(startIndex);
                if(!startTrack) {
                    interaction.followUp({embeds: [Embed("There is no song in the Position you specified.", 3)]})
                    return;
                }
                interaction.followUp({embeds: [Embed(`Removed \`\` ${(endIndex - startIndex).toString()} Track \`\``, 1)]});
                queue.RemoveRange(startIndex, endIndex);
                return;

        }

    }
})