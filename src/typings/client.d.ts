import { ChatInputApplicationCommandData, ClientOptions, CommandInteraction, CommandInteractionOptionResolver, GuildMember, Interaction } from "discord.js"
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
export type AutoCompleteFunction = (interaction:ExtendedInteraction) => any;

export enum Permissions {
    Default = 0,
    AddToQueue = 1,
    ViewQueue = 2,
    ManagePlayer = 3,
    ManageQueue = 4,
    ManageServer = 5
}

export type PermissionsString = "Default" | "AddToQueue" | "ViewQueue" | "ManagePlayer" |  "ManageQueue" | "ManageServer"

export type CommandType = {
    permissions:Permissions | PermissionsString,
    run:RunFunction,
    Autocomplete?:AutoCompleteFunction
} & ChatInputApplicationCommandData