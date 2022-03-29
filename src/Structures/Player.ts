/**
 * @https://www.npmjs.com/package/play-dl
 */
import { Guild } from 'discord.js';
import play, { YouTubeVideo } from 'play-dl';
import { AquieClient } from './Client';
import { Queue } from './Queue';

export class Player {
    public client:AquieClient;

    constructor(client: AquieClient) {
        this.client = client;
    }
    async search(query:string) {
        const validate = await play.validate(query);
        if(!validate) return [];

        switch(validate) {
            case "search":
                return await play.search(query, {limit: 1,source: {youtube: "video"}});
            case "yt_video":
                return [(await play.video_info(query)).video_details as YouTubeVideo];
        }

        return [];
    }

    createQueue(guild: Guild) {
        if(!guild.queue) { guild.queue = new Queue(this.client); }
        return guild.queue;
    }

    getQueue(guild: Guild):Queue | null {
        return guild.queue;
    }
}