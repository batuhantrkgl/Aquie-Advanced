import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
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
        }
    ],
    run: async({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        switch(interaction.options.getSubcommand()) {
            case "save":
                let user: DBUser | null = await interaction.client.db.getUser(interaction.user.id);
                if(!user) await interaction.client.db.addUser(interaction.user);

                
                const playlist: Playlist = {
                    playlist_name:  interaction.options.getString("playlist_name"),
                    tracks: queue.tracks
                };

                await interaction.client.db.saveQueue(interaction.user.id, playlist);
                await interaction.followUp({embeds: [Embed(`Your queue has been saved to your playlists with the name \` ${interaction.options.getString("playlist_name")} \`.`, 1)]});
                break;
            case "remove":
                
        }
    }
})