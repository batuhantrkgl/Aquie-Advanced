import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";

export type UnitTypes = "minute" | "m" | "s" | "second";

export default new Command({
    name: "seek",
    description: "Skips to the specified timestamp in the currently playing track",
    permissions: "ManagePlayer",
    voiceChannel: true,
    options: [
        {
            name: "position",
            description: "Specify the Position you want to Jump <(1s, 1m)>",
            type: "STRING",
            required: true
        }
    ],
    run: async ({ interaction }) => {
        const queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });


        const unitTypes = ["m", "s"];

        const position: string = interaction.options.getString("position");
        let second: number = 0;
        let current: string = "";
        for (const item of position) {
            if (Number(item) || item == "0") {
                current += item;
                continue;
            }
            if (!unitTypes.includes(item.toLowerCase())) {
                interaction.followUp({ embeds: [Embed("You can type seconds or minutes.", 3)] });
                return;
            }

            switch (item as UnitTypes) {
                case "m":
                    second += parseInt(current) * 60;
                    current = "";
                    break;
                case "s":
                    second += parseInt(current);
                    current = "";
                    break;
            }
        };

        queue.Seek(second).catch(() => {});
        await interaction.followUp({ embeds: [Embed("The position of the song has been adjusted", 1)] });

    }
})