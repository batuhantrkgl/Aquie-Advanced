import { GuildMember } from "discord.js"
import { YouTubeVideo } from "play-dl";

export type SearchValidation = false | "so_playlist" | "so_track" | "sp_track" | "sp_album" | "sp_playlist" | "dz_track" | "dz_playlist" | "dz_album" | "yt_video" | "yt_playlist" | "search";

export type SearchOptions = {
    requestBy?: GuildMember,
    filter?: SearchValidation[]
}

export type TrackTypes = "YOUTUBE" | "SPOTIFY";

export type Artist = {
    name: string,
    id?: string,
    url?: string
};

export type Track = {
    title: string,
    url: string,
    type: TrackTypes,
    requestBy?: GuildMember,
    artists?: Artist[]
};

export type Playlist = {
    name: string,
    url: string,
    tracks: Track[],
    type: TrackTypes
    requestBy?: GuildMember
}

export type SearchResult = {
    type: "playlist" | "track" | "null",
    playlist_name?: string,
    playlist_url?: string,
    tracks?: Track[] | null,
    requestBy?: GuildMember
};

