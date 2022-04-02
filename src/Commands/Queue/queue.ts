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

    public updateContent(newContent: string): void {
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
        let currentPage = 0;

        //Page Create!
        const totalPage = queue.tracks.length / 10;
        console.log(totalPage);
        
        for(let i=0;i < totalPage;i++){
            console.log("Create Page!")
            pages.push(new QueuePage(null));
        }

        console.log(`${pages.length} Sayfa Oluşturuldu..`);

        if(pages.length == 0) {
            pages.push(new QueuePage("**This is Empty**"));
        }

        pages.forEach((page, index) => {
            console.log(`${index}.Page Hazırlanıyor.`)
            let trackPosition = 1;
            for(const track of queue.tracks) {
                content += `**[${trackPosition}]** ▫️ \`\` ${track.title} \`\`\n`;
                page.updateContent(content);
                trackPosition++;
                if(trackPosition == 10) { break; }
            }
        })

        console.log(pages);
        
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
                await i.update({
                    embeds: [{
                        color: "WHITE",
                        description: "**This is Empty**"
                    }]
                }).catch(() => {});
                return;
            }

            await i.update({
                embeds: [{
                    color: "WHITE",
                    description: pages[currentPage].content
                }]
            }).catch(() => {})

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
