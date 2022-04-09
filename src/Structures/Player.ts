import { Collection, Guild, GuildMember } from 'discord.js';
import play, { SoundCloudTrack, SpotifyAlbum, SpotifyPlaylist, SpotifyTrack, YouTubePlayList, YouTubeVideo } from 'play-dl';
import { SearchOptions, SearchResult, Track } from '../Typings/player';
import { QueueOptions } from '../Typings/queue';
import { AquieClient } from './Client';
import { Queue } from './Queue';
import tokenOptions from '../../tokenOptions.json';

export class Player {
    public client: AquieClient;
    public readonly queue:Collection<string, Queue>
    
    constructor(client: AquieClient) {
        this.client = client;
        this.queue = new Collection();
        play.setToken(tokenOptions);
    }

    async search(query: string, options: SearchOptions = { "filter": ["search"] }): Promise<SearchResult> {
        const validate = await play.validate(query);
        if (!options.filter.includes(validate)) return { type: null, tracks: null } as SearchResult;

        const requestBy: GuildMember | null = options.requestBy == null ? null : options.requestBy

        switch (validate) {
            case "search":
                const searchResult = await play.search(query, { source: { "youtube": "video" }, limit: 1 });
                if (searchResult.length == 0) return { type: null, tracks: null } as SearchResult;

                const searchTrack: Track = {
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
                let videoResult: YouTubeVideo = null;
                try {
                    videoResult = (await play.video_info(query, { htmldata: false })).video_details;
                } catch { return { type: null, tracks: null } as SearchResult; }

                const videoTrack: Track = {
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
                let playlistResult: YouTubePlayList = null;
                try {
                    playlistResult = await play.playlist_info(query, { incomplete: true });
                } catch (e) { return { type: null, tracks: null } as SearchResult; }
                let tracks: YouTubeVideo[] | Track[] = await playlistResult.all_videos();

                tracks = tracks.map((youtubeVideo) => {
                    return {
                        title: youtubeVideo.title,
                        url: youtubeVideo.url,
                        type: "YOUTUBE",
                        requestBy: requestBy
                    } as Track
                })

                return {
                    type: "playlist",
                    playlist_name: playlistResult.title,
                    playlist_url: playlistResult.url,
                    tracks: tracks,
                    requestBy: requestBy
                } as SearchResult

            case "sp_track":
                const spotifyResult: SpotifyTrack = await play.spotify(query) as SpotifyTrack;

                const spotifyTrack = {
                    title: `${spotifyResult.name}`,
                    url: null,
                    requestBy: requestBy,
                    type: "SPOTIFY",
                    artists: spotifyResult.artists
                } as Track

                return {
                    type: "track",
                    requestBy: requestBy,
                    tracks: [spotifyTrack]
                } as SearchResult;
            case "sp_playlist":
                let spPlaylist: SpotifyPlaylist;
                try {
                    spPlaylist = await play.spotify(query) as SpotifyPlaylist;
                } catch (e) { return { type: null, tracks: null } };

                let spTracks: SpotifyTrack[] | Track[] = await spPlaylist.all_tracks();

                spTracks = spTracks.map((track) => {
                    return {
                        title: track.name,
                        url: null,
                        type: "SPOTIFY",
                        requestBy: requestBy,
                        artists: track.artists
                    } as Track
                });

                return {
                    type: "playlist",
                    playlist_name: spPlaylist.name,
                    playlist_url: spPlaylist.url,
                    tracks: spTracks,
                    requestBy: requestBy
                } as SearchResult;

            case "sp_album":
                const spAlbum = await play.spotify(query) as SpotifyAlbum;
                
                const albumTracks: Track[] = (await spAlbum.all_tracks()).map((track) => {

                    return {
                        title: track.name,
                        url: null,
                        type: "SPOTIFY",
                        requestBy: requestBy,
                        artists: track.artists
                    } as Track;
                });

                return {
                    type: "playlist",
                    playlist_name: spAlbum.name,
                    playlist_url: spAlbum.url,
                    tracks: albumTracks,
                    requestBy: requestBy
                } as SearchResult;

            case "so_track": 
                const soundCloudTrack = await play.soundcloud(query) as SoundCloudTrack;
                const track:Track =  {
                    title: soundCloudTrack.name,
                    url: soundCloudTrack.url,
                    type: "YOUTUBE",
                    requestBy: requestBy,
                };

                return {
                    type: "track",
                    tracks: [track],
                    requestBy: requestBy
                } as SearchResult;
        }
    }

    createQueue(guild: Guild, options: QueueOptions) {
        if(!this.queue.has(guild.id)) {
            this.queue.set(guild.id, new Queue(guild, {
                textChannel: options.textChannel
            }));
        }
    
        return this.getQueue(guild);
    }

    getQueue(guild: Guild): Queue | null {
        return this.queue.get(guild.id);
    }
}