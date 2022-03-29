import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export enum Embeds  {
    Default = 1,
    Warn = 2,
    Error = 3
}

export const Embed = (description:string, type:Embeds):MessageEmbedOptions => {
    switch(type) {
        case Embeds.Default:
            return {
                color: "WHITE",
                description: `**▫️ ${description}**`
            };
        case Embeds.Warn: {
            return {
                color: "WHITE",
                description: `**❕ ${description}**`
            };
        }
        case Embeds.Error: {
            return {
                color: "WHITE",
                description: `**❔ ${description}**`
            }
        }
    }
}

export const NowPlayingEmbed = (title:string):MessageEmbedOptions => {
    return {
        color: "WHITE",
        title: "Now Playing",
        description: `**▫️ \`\` ${title} \`\`**`,
    };
}