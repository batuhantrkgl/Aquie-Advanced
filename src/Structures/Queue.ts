import play_dl from "play-dl";
import { Message, TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice';
import { AquieClient } from "./Client";
import { Track } from "../Typings/player";
import { NowPlayingEmbed } from "../Functions/Embed";
import { QueueOptions, QueueRepeatMode } from "../Typings/queue";
import { isThisTypeNode } from "typescript";

export class Queue {

    public readonly tracks: Track[];
    private connection: VoiceConnection | null;
    public playing: false | true;
    public client: AquieClient;
    public player: AudioPlayer;
    public current: number;
    private textChannel: TextBasedChannel | null;
    public npMessage: Message<boolean>;
    public repeatMode:QueueRepeatMode;
    
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
        this.setRepeatMode(QueueRepeatMode.Default);

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playing = false;

            switch(this.repeatMode){
                case QueueRepeatMode.Default:
                    this.Skip();
                    break;
                case QueueRepeatMode.Track:
                    this.Play();
                    this.nowPlayingMessage();
                    break;
                case QueueRepeatMode.Queue:
                    if(this.current + 1 != this.tracks.length) { { this.Skip();  break; } }
                    this.current = 0;
                    this.nowPlayingMessage();
                    this.Play();
                    break;
            }
            
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
        if(track.type == "SPOTIFY") this.spotifyToYoutube(track);
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

    public Back(): void {
        this.current -= 2;
        this.Stop();
    }

    public setRepeatMode(mode: QueueRepeatMode): void {
        if(mode == this.repeatMode) return;
        this.repeatMode = mode;
    }

    Jump(position:number) :void {
        //if(this.paused) { this.Resume(); }
        if(this.playing){
            this.current = position - 2;
            this.player.stop();
            return;
        }

        this.current = position - 1;
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