import { Embed, NowPlayingEmbed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { Queue } from "../../Structures/Queue";
import { DBUser, Playlist } from "../../Typings/database";

export default new Command({
    name: "playlist",
    description: "Manages playlists.",
    permissions: "ViewQueue",
    voiceChannel: true,
    options: [
        {
            name: "save",
            description: "Saved queue",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "playlist_name",
                    description: "Specify the name of the playlist.",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "remove",
            description: "Deletes a saved queue",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "playlist_name",
                    description: "Specify the name of the playlist you want to delete.",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "load",
            description: "Adds a playlist to your queue.",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "playlist_url",
                    description: "The name of the playlist you want to add or its link if you want to play someone else's playlist.",
                    type: "STRING",
                    required: true
                }
            ]
        }
    ],
    run: async ({ interaction }) => {

        let user: DBUser | null = await interaction.client.db.getUser(interaction.user.id);
        let playlistName: string = interaction.options.getString("playlist_name");
        let queue: Queue | null = interaction.client.player.getQueue(interaction.guild);

        switch (interaction.options.getSubcommand()) {
            case "save":
                if (user == null) user = await interaction.client.db.addUser(interaction.user);

                if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

                const dbPlaylist: Playlist = {
                    playlist_name: playlistName,
                    url: `aquie/playlists/${interaction.user.id}/${playlistName}`,
                    tracks: queue.tracks
                };

                const savePlaylist = await interaction.client.db.saveQueue(user, dbPlaylist);
                await interaction.followUp({ embeds: [Embed(`Your queue has been saved to your playlists with the name \` ${savePlaylist.playlist_name} \`.`, 1)] });
                break;
            case "remove":
                if (!user || !user.playlists.find((value) => value.playlist_name === playlistName)) {
                    interaction.followUp({ embeds: [Embed("You do not have a playlist with this name.", 3)] });
                    return;
                }
                await interaction.client.db.removeQueue(user, playlistName);
                await interaction.followUp({ embeds: [Embed(`Your playlist named ${playlistName} has been deleted.`, 1)] });
                break;
            case "load":
                if (!queue) {
                    queue = interaction.client.player.createQueue(interaction.guild, {
                        textChannel: interaction.channel,
                    });
                }

                queue.connect(interaction.member.voice.channel);

                const url = interaction.options.getString("playlist_url");
                const urlData = url.split("/");

                //this a url
                let playlist: Playlist | null;
                if (urlData.length == 4) {
                    const targetUser = await interaction.client.db.getUser(urlData[2]);
                    if(!targetUser) {
                        await interaction.followUp({embeds: [Embed("There is no such playlist", 3)]});
                        return;
                    }
                    playlistName = urlData[3];
                    playlist = await interaction.client.db.getQueue(targetUser, playlistName);
                    if(!targetUser || !playlist) {
                        await interaction.followUp({ embeds: [Embed(`A playlist named \` ${playlistName} \` could not be found.`, 3)] });
                        return;
                    };


                } else {
                    if(!user) {
                        await interaction.followUp({embeds: [Embed("You do not have a playlist.", 3)]});
                        return;
                    }
                    playlistName = url;
                    playlist = await interaction.client.db.getQueue(user, playlistName);
                    if (!playlist) {
                        await interaction.followUp({ embeds: [Embed(`A playlist named \` ${playlistName} \` could not be found.`, 3)] });
                        return;
                    }
                }
                const { channel } = interaction;
                interaction.followUp({ embeds: [Embed(`\`\` ${playlistName} \`\` playlist added to queue`, 1)] });
                playlist.tracks.forEach((track) => queue.addTrack(track));
                if (queue.playing) return;
                queue.Play();
                queue.npMessage = await channel.send({ embeds: [NowPlayingEmbed(`${playlist.tracks[0].title}`)] });

        }
    }
})