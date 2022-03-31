import { Message } from "discord.js";
import { player } from "../..";
import { Embed, NowPlayingEmbed } from "../../Functions/Embed";
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
    run: async ({ interaction }) => {
        const query = interaction.options.getString("query");
        const result = await player.search(query, {
            requestBy: interaction.member,
            filter: ["search", "yt_video", "yt_playlist", "sp_track","sp_playlist", "sp_album"]
        });

        const queue = player.createQueue(interaction.guild, {
            textChannel: interaction.channel
        });

        queue.connect(interaction.member.voice.channel);

        switch (result.type) {
            case null:
                interaction.followUp({ embeds: [Embed("No Song Found", 3)] })
                return;
            case "track":
                queue.addTrack(result.tracks[0]);
                if (queue.playing) { interaction.followUp({ embeds: [Embed(`Queued \`\` ${result.tracks[0].title} \`\``, 1)] }); return; }
                queue.Play();
                queue.npMessage = await interaction.followUp({ embeds: [NowPlayingEmbed(result.tracks[0].title)] }) as Message;
                break;
            case "playlist":
                const { channel } = interaction;
                result.tracks.forEach((track) => queue.addTrack(track));
                interaction.followUp({ embeds: [Embed(`\`\` ${result.playlist_name} \`\` playlist added to queue`, 1)] });
                if (queue.playing) return;
                queue.Play();
                queue.npMessage = await channel.send({ embeds: [NowPlayingEmbed(`${result.tracks[0].title}`)] });
                break;
        }

    }
})