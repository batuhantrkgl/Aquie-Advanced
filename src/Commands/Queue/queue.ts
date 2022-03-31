import { player } from "../..";
import { Embed } from "../../Functions/Embed";
import { Command } from "../../Structures/Command";
import { Queue } from "../../Structures/Queue";
import { CacheType, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js';

class QueuePage {
    public content: string;

    constructor(content: string) {
        this.content = content;
    }

    updateContent(newContent: string) {
        this.content = newContent;
    }

}

export default new Command({
    name: "queue",
    description: "Displays the current song queue",
    permissions: "ViewQueue",
    voiceChannel: true,
    run: ({ interaction }) => {
        const queue: Queue = player.getQueue(interaction.guild);
        if (!queue) return interaction.followUp({ embeds: [Embed("There is no queue.", 3)] });


        const pages: QueuePage[] = [];

        let content: string = "";
        let pageContentIndex = 0;
        let currentPage = 0;

        queue.tracks.forEach((track, index) => {
            pageContentIndex++;
            content += `**[${index + 1}]** ▫️ \`\` ${track.title} \`\`\n`;

            if (pageContentIndex == 10) {
                pages.push(new QueuePage(content));
                content = "";
                pageContentIndex = 0;
            }
        })

        if (queue.tracks.length < 10) pages.push(new QueuePage(content));

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("back")
                    .setLabel("BACK")
                    .setStyle("SECONDARY"),
                new MessageButton()
                    .setCustomId("next")
                    .setLabel("NEXT")
                    .setStyle("SECONDARY")

            );


        const filter = i => i.user.id === interaction.member.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });


        collector.on("collect", async i => {
            if (i.customId == "next") currentPage++;
            else { currentPage--; }
            if (pages[currentPage] == null) {
                i.update({
                    embeds: [{
                        color: "WHITE",
                        description: "**This is Empty**"
                    }]
                });
                return;
            }

            i.update({
                embeds: [{
                    color: "WHITE",
                    description: pages[currentPage].content
                }]
            })
        })

        collector.on("end", (collected) => {
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);
            interaction.editReply({ components: [row] });
        })

        interaction.followUp({
            embeds: [{
                color: "WHITE",
                description: pages[currentPage].content
            }], components: [row]
        });

    }
})