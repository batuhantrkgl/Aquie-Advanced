import { MessageActionRow, MessageButton } from "discord.js";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { Queue } from "../../Structures/Queue";


export default new Command({
    name: "queue",
    description: "Displays the current song queue",
    permissions: "ViewQueue",
    voiceChannel: true,
    run: async ({ interaction }) => {
        const queue: Queue = interaction.client.player.getQueue(interaction.guild);
        if (!queue) return await interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });

        const pages:string[] = [];

        let pageIndex = 0;
        let text = "";
        queue.tracks.forEach((track, index) => {
            text += `\n**[${index + 1}]** ▫️ \`\` ${track.title} \`\``;
            pages[pageIndex] = text;
            if(!((index + 1) / 10).toString().includes(".")) {
                pageIndex++;
                text = "";
            }
        });

        const row = new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId("first")
            .setLabel("FIRST")
            .setStyle("SECONDARY"),
            new MessageButton()
            .setCustomId("back")
            .setLabel("BACK")
            .setStyle("SECONDARY"),
            new MessageButton()
            .setCustomId("next")
            .setLabel("NEXT")
            .setStyle("SECONDARY"),
            new MessageButton()
            .setCustomId("last")
            .setLabel("LAST")
            .setStyle("SECONDARY")
        );

        const filter = i => i.user.id === interaction.user.id;

        const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 120000 });

        let currentPage: number = 0;

        collector.on("collect", async(i) => {
            switch(i.customId) {
                case "first":
                    currentPage = 0;
                    break;
                case "next":
                    currentPage++;
                    break;
                case "back":
                    currentPage--;
                    break;
                case "last":
                    currentPage = pages.length - 1;
                    break;
            }

            await i?.update({embeds: [
                {
                    color: "WHITE",
                    description: pages[currentPage] || "**This is Empty**"
                }
            ], components: [row]}).catch((e) => {  return; });
            return;
        })

        await interaction?.followUp({embeds: [
            {
                color: "WHITE",
                description: pages[currentPage] || "**This is Empty**"
            }
        ], components: [row]}).catch(() => {});

        collector.on("end", (collected) => {
            row.components.forEach((component) => component.setDisabled(true));
            interaction?.editReply({components: [row]});
        })
    
    }
})
