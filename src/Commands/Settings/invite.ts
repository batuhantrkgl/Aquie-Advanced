import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export default new Command({
    name: "invite",
    description: "Bot Invite Link",
    voiceChannel: false,
    permissions: "Default",
    run: ({ interaction }) => {
        interaction.followUp({
            embeds: [Embed(
                `[Invite](${interaction.client.inviteURL})`
                , 1)]
        });
    }
})