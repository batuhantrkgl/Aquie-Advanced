import { Guild, TextBasedChannel } from "discord.js";

export type QueueOptions = {
    textChannel:TextBasedChannel,
};

export enum QueueRepeatMode {
    Default = 1,
    Track = 2,
    Queue = 3,
};
