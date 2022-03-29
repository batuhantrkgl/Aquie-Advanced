import { player } from "../..";
import { Embed, Embeds, NowPlayingEmbed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "play",
    description: "Loads your input and adds it to the queue; If there is no playing track, then it will start playing",
    permissions: "AddToQueue",
    voiceChannel: true,
    options: [
        {
            name: "query",
            description: "<url or title>(Youtube | Spotify)",
            type: "STRING",
            required: true
        }
    ],
    run: async({ interaction }) => {
        const query = interaction.options.getString("query");
        const tracks = await player.search(query);

        if(tracks.length == 0) {
            interaction.followUp({embeds: [Embed("No Song Found", 3)]})
            return;
        }

        const queue = player.createQueue(interaction.guild);
        queue.connect(interaction.member.voice.channel);
        queue.addTrack(tracks[0]);

        if(queue.playing) {
            interaction.followUp({embeds: [Embed(`Queued \`\` ${tracks[0].title} \`\``, 1)]});
            return;
        }
        
        interaction.followUp({embeds: [NowPlayingEmbed(`${tracks[0].title}`)]});

        await queue.play();




    }
})