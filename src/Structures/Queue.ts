import play_dl from "play-dl";
import { Message, TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice';
import { AquieClient } from "./Client";
import { Track } from "../Typings/player";
import { QueueOptions } from "../Typings/queue";
import { NowPlayingEmbed } from "../Functions/Embed";



export class Queue {

    public readonly tracks: Track[];
    private connection: VoiceConnection | null;
    public playing: false | true;
    public client: AquieClient;
    public player: AudioPlayer;
    public current: number;
    private textChannel: TextBasedChannel | null;
    public npMessage: Message<boolean>;

    constructor(client: AquieClient, options: QueueOptions) {
        this.tracks = [];
        this.connection = null;
        this.playing = false;
        this.client = client;
        this.player = new AudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
        this.current = 0;
        this.textChannel = options.textChannel;
        this.npMessage = null;
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playing = false;
            this.Skip();
        })

    }

    connect(channel: VoiceBasedChannel) {
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        return this.connection;
    };


    private async spotifyToYoutube(track: Track): Promise<boolean> {
        const youtubeResult = await play_dl.search(`${track.artists[0].name} ${track.title}`, { limit: 1, source: { youtube: "video" } });
        if (youtubeResult.length == 0) return false; //  // channel.send("SPOTFY TRACK ERROR!");
        track.url = youtubeResult[0].url;
        return true;
    }


    public addTrack(track: Track): Track {
        this.tracks.push(track);
        this.spotifyToYoutube(this.nowPlaying());
        return track;
    }

    public nowPlaying(): Track | null {
        return this.tracks[this.current] || null;
    }

    private async nowPlayingMessage(): Promise<void> {
        try {
            if (this.npMessage) this.npMessage.delete();
            this.npMessage = await this.textChannel.send({ embeds: [NowPlayingEmbed(this.nowPlaying().title)] });
        } catch { return; }
    }

    public Stop(): void {
        this.player.stop();
    }

    public Skip(): void {
        if (this.playing) {
            this.player.stop();
            return;
        }
        this.current++;
        if (this.nowPlaying() == null) return this.Stop();
        this.nowPlayingMessage();
        this.Play();
    }

    public async Play(): Promise<void> {

        this.playing = true;

        if (this.nowPlaying().type == "SPOTIFY" && this.nowPlaying().url == null) {
            if (await this.spotifyToYoutube(this.nowPlaying()) == false) { this.Skip(); return; }
        }

        const stream = await play_dl.stream(this.nowPlaying()?.url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.player.play(resource);
        this.connection.subscribe(this.player);
    }

}