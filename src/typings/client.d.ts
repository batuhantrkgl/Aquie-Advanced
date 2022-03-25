import { ChatInputApplicationCommandData, ClientOptions, CommandInteraction, CommandInteractionOptionResolver, GuildMember } from "discord.js"
import { AquieClient } from "../Structures/Client"

export type AquieClientOptions = {
    token:string
} & ClientOptions

export type ExtendedInteraction = {
    member:GuildMember
} & CommandInteraction

export type RunFunctionOptions = {
    interaction:ExtendedInteraction,
    client:AquieClient,
    args:CommandInteractionOptionResolver
}

export type RunFunction = (options:RunFunctionOptions) => any;

export type CommandType = {
    run:RunFunction
} & ChatInputApplicationCommandData