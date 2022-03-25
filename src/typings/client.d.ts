import { ChatInputApplicationCommandData, ClientOptions, CommandInteractionOptionResolver, GuildMember, Interaction } from "discord.js"

export type AquieClientOptions = {
    token:string
} & ClientOptions

export type ExtendedInteraction = {
    member:GuildMember
} & Interaction

export type RunFunctionOptions = {
    interaction:ExtendedInteraction,
    args:CommandInteractionOptionResolver
}

export type RunFunction = (options:RunFunctionOptions) => any;

export type CommandType = {
    run:RunFunction
} & ChatInputApplicationCommandData