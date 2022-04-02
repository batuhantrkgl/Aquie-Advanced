import play_dl from "play-dl";
import { Message, TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice';
import { AquieClient } from "./Client";
import { Track } from "../Typings/player";
import { NowPlayingEmbed } from "../Functions/Embed";
import { QueueOptions, QueueRepeatMode } from "../Typings/queue";

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
    public paused:boolean;
    
    constructor(client: AquieClient, options: QueueOptions) {
        this.tracks = [];
        this.connection = null;
        this.playing = false;
        this.client = client;
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
    

        this.paused = false;
        this.current = 0;
        this.textChannel = options.textChannel;
        this.npMessage = null;
        this.repeatMode = QueueRepeatMode.Default;

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

        this.connection.subscribe(this.player);
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

    public get nowPlaying():Track | null {
        return this.tracks[this.current] || null;
    }

    private async nowPlayingMessage(): Promise<void> {
        try {
            if (this.npMessage) this.npMessage.delete();
            this.npMessage = await this.textChannel.send({ embeds: [NowPlayingEmbed(this.nowPlaying.title)] });
        } catch { return; }
    }

    public Stop(): void {
        if(this.paused) { this.Resume(); }
        this.player.stop();
    }

    public Skip(): void {
        if(this.paused) { this.Resume(); }
        if (this.playing) {
            this.player.stop();
            return;
        }
        this.current++;
        if (this.nowPlaying == null) return this.Stop();
        this.nowPlayingMessage();
        this.Play();
    }

    public Back(): void {
        if(this.paused) { this.Resume(); }
        this.current -= 2;
        this.Stop();
    }

    public setRepeatMode(mode: QueueRepeatMode): void {
        if(mode == this.repeatMode) return;
        this.repeatMode = mode;
    }

    /**
     * Pauses the Song.
     * @returns
     */
    Pause(): void {
        if(this.playing) this.player.pause();
        this.paused = true;
    }
    /**
     * Plays the paused song.
     */
    Resume(): void {
        this.player.unpause();      
        this.paused = false;  
    }

    Jump(position:number) :void {
        if(this.paused) { this.Resume(); }
        if(this.playing){
            this.current = position - 2;
            this.player.stop();
            return;
        }

        this.current = position - 1;
        this.nowPlayingMessage();
        this.Play();
    }

    public Disconnect(): void { this.connection.disconnect(); }

    public getTrack(trackIndex: number):Track { return this.tracks[trackIndex]; };

    public Remove(trackIndex: number): void { this.tracks.splice(trackIndex, 1); };

    public RemoveRange(startIndex: number, endIndex: number) { this.tracks.splice(startIndex, endIndex); };
    
    public async Play(): Promise<void> {

        this.playing = true;
        const track = this.nowPlaying;
        if(!track) return;

        if (track.type == "SPOTIFY" && track.url == null) {
            if (await this.spotifyToYoutube(track) == false) { this.Skip(); return; }
        }

        const stream = await play_dl.stream(track.url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.player.play(resource);
    }

}