import { Guild, GuildMember } from 'discord.js';
import play, { YouTubePlayList, YouTubeVideo } from 'play-dl';
import { Playlist, SearchOptions, SearchResult, Track } from '../Typings/player';
import { QueueOptions } from '../Typings/queue';
import { AquieClient } from './Client';
import { Queue } from './Queue';

export class Player {
    public client:AquieClient;

    constructor(client: AquieClient) {
        this.client = client;
    }
    async search(query:string, options:SearchOptions = {"filter": ["search"]}) {
        const validate = await play.validate(query);
        if(!options.filter.includes(validate)) return { type: null, tracks: null} as SearchResult;

        const requestBy:GuildMember | null = options.requestBy == null ? null : options.requestBy

        switch(validate) {
            case "search": 
                const searchResult = await play.search(query, {source: {"youtube": "video"}, limit: 1});
                if(searchResult.length == 0) return { type: null, tracks: null } as SearchResult;

                const searchTrack:Track = {
                    title: searchResult[0].title,
                    url: searchResult[0].url,
                    type: "YOUTUBE",
                    requestBy: requestBy
                };

                return {
                    type: "track",
                    tracks: [searchTrack],
                    requestBy: requestBy
                } as SearchResult;

            case "yt_video":
                let videoResult:YouTubeVideo = null;
                try {
                    videoResult =  (await play.video_info(query, { htmldata: false })).video_details;
                } catch { return {type: null, tracks: null} as SearchResult; }

                const videoTrack:Track =  {
                    title: videoResult.title,
                    url: videoResult.url,
                    type: "YOUTUBE",
                    requestBy: requestBy
                };

                return {
                    type: "track",
                    tracks: [videoTrack],
                    requestBy: requestBy
                } as SearchResult

            case "yt_playlist":
                let playlistResult:YouTubePlayList = null;
                try {
                    playlistResult = await play.playlist_info(query, {incomplete: true});
                } catch(e) { return { type: "null", tracks: null} as SearchResult; }
                let tracks:YouTubeVideo[] | Track[] = await playlistResult.all_videos();

                tracks = tracks.map((youtubeVideo) => {
                    return {
                        title: youtubeVideo.title,
                        url: youtubeVideo.url,
                        type: "YOUTUBE",
                        requestBy: requestBy
                    } as Track
                })

                const playlist:Playlist = {
                    name: playlistResult.title,
                    url: playlistResult.url,
                    tracks: tracks,
                    requestBy: requestBy,
                    type: "YOUTUBE"
                };

                return {    
                    type: "playlist",
                    playlist_name: playlist.name,
                    playlist_url: playlist.url,
                    tracks: playlist.tracks,
                    requestBy: requestBy
                } as SearchResult
        }

        
    }

    createQueue(guild: Guild, options:QueueOptions) {
        if(!guild.queue) { guild.queue = new Queue(this.client, { textChannel: options.textChannel}) };
        return guild.queue;
    }

    getQueue(guild: Guild):Queue | null {
        return guild.queue;
    }
}