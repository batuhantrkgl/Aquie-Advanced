import play_dl, { SoundCloudStream, YouTubeStream } from "play-dl";
import { Guild, Message, TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice';
import { AquieClient } from "./Client";
import { Track } from "../Typings/player";
import { NowPlayingEmbed } from "../Functions/Embed";
import { QueueOptions, QueueRepeatMode } from "../Typings/queue";
import { client } from "..";

export class Queue {

    public readonly tracks: Track[];
    private connection: VoiceConnection | null;
    public playing: false | true;
    public client: AquieClient;
    public player: AudioPlayer;
    public current: number;
    private readonly textChannel: TextBasedChannel | null;
    public readonly guild: Guild;
    public npMessage: Message<boolean>;
    public repeatMode: QueueRepeatMode;
    public paused: boolean;
    private notPlayingTime: number;

    constructor(guild: Guild, options: QueueOptions) {
        this.tracks = [];
        this.connection = null;
        this.playing = false;
        this.guild = guild;
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
        
        this.client = client;
        this.paused = false;
        this.current = 0;
        this.textChannel = options.textChannel;
        this.npMessage = null;
        this.repeatMode = QueueRepeatMode.Default;
        this.notPlayingTime = 0;


        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playing = false;

            switch (this.repeatMode) {
                case QueueRepeatMode.Default:
                    this.Skip();
                    break;
                case QueueRepeatMode.Track:
                    this.Play();
                    this.nowPlayingMessage();
                    break;
                case QueueRepeatMode.Queue:
                    if (this.current + 1 != this.tracks.length) { { this.Skip(); break; } }
                    this.current = 0;
                    this.nowPlayingMessage();
                    this.Play();
                    break;
            }
        })

        this.queueDestroyListener();

    }

    queueDestroyListener() {
        const interval = setInterval(() => {
            if (this.guild.queue == null) { clearInterval(interval); }
            if (this.playing == true) return this.notPlayingTime = 0;
            this.notPlayingTime++;
            if (this.notPlayingTime == 5) {
                this.Destroy();
            }
        }, 5 * 10000);
        /**
        * Deleting the queue after the bot leaves the voice channel.
        */
        this.client.on("voiceStateUpdate", (oldState, newState) => {
            /*
                Delete action {number} seconds after bot leaves voice channel
                > If it does not re-enter the same audio channel within the specified time.
            */
            let botChannel = this.guild.me.voice.channel;
            if (oldState.id == this.client.user.id) {
                const leftChannel = oldState.channel;
                if (botChannel != null) return;
                setTimeout(() => {
                    botChannel = this.guild.me.voice.channel;
                    if (botChannel == null) { return this.Destroy(); }
                    if (botChannel.id != leftChannel.id) { return this.Destroy() };
                }, 5 * 1000);
            }
            /**
            * Status of being alone in the bot voice channel
            */
            if (newState.channel == null) {
                if (!botChannel) return;
                if (oldState.channel.id != botChannel.id) return;
                console.log("Member  voice channel left!");
                console.log(botChannel.members.size);
                if (botChannel.members.size != 1) return;
                setTimeout(() => {
                    botChannel = this.guild.me.voice.channel;
                    if (botChannel.members.size == 1) { this.Destroy(); }
                }, 5 * 10000);
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
        if (youtubeResult.length == 0) return false;
        track.url = youtubeResult[0].url;
        return true;
    }


    public addTrack(track: Track): Track {
        this.tracks.push(track);
        if (track.type == "SPOTIFY") this.spotifyToYoutube(track);
        return track;
    }

    public get nowPlaying(): Track | null {
        return this.tracks[this.current] || null;
    }

    private async nowPlayingMessage(): Promise<void> {
        try {
            if (this.npMessage) this.npMessage.delete();
            this.npMessage = await this.textChannel.send({ embeds: [NowPlayingEmbed(this.nowPlaying.title)] });
        } catch { return; }
    }

    public Stop(): void {
        if (this.paused) { this.Resume(); }
        this.player.stop();
    }

    public Skip(): void {
        if (this.paused) { this.Resume(); }
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
        if (this.paused) { this.Resume(); }
        this.current -= 2;
        this.Stop();
    }

    /**
    * Sets repeat mode
    * @param  {QueueRepeatMode} mode The repeat mode
    * @returns {boolean}
    */
    public setRepeatMode(mode: QueueRepeatMode): boolean {
        if (mode == this.repeatMode) return false;
        this.repeatMode = mode;
        return true;
    }

    /**
     * Pauses the Song.
     * @returns
     */
    Pause(): void {
        if (this.playing) this.player.pause();
        this.paused = true;
    }
    /**
     * Plays the paused song.
     */
    Resume(): void {
        this.player.unpause();
        this.paused = false;
    }

    Jump(position: number): void {
        if (this.paused) { this.Resume(); }
        if (this.playing) {
            this.current = position - 2;
            this.player.stop();
            return;
        }

        this.current = position - 1;
        this.nowPlayingMessage();
        this.Play();
    }

    public Disconnect(): void { this.connection.disconnect(); }

    public getTrack(trackIndex: number): Track { return this.tracks[trackIndex]; };

    public Remove(trackIndex: number): void {
        this.tracks.splice(trackIndex, 1);
        if (this.current > this.tracks.length) {
            this.current = this.tracks.length - 1;
        }
    };

    public RemoveRange(startIndex: number, endIndex: number) {
        this.tracks.splice(startIndex, endIndex);
        if (this.current > this.tracks.length) {
            this.current = this.tracks.length - 1;
        }
    };

    public Clear(): void {
        this.tracks.splice(0, this.tracks.length);
        this.current = 0;
    }

    public async Seek(second: number) {
        if (!this.nowPlaying) throw new Error("[QueueError/Seek] : The currently playing song cannot be found.");

        const stream = await play_dl.stream(this.nowPlaying.url, {
            discordPlayerCompatibility: false,
            seek: second
        });

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.player.play(resource);
    }

    public async Play(): Promise<void> {

        this.playing = true;
        const track = this.nowPlaying;
        if (!track) return;

        if (track.type == "SPOTIFY" && track.url == null) {
            if (await this.spotifyToYoutube(track) == false) { this.Skip(); return; }
        }

        const stream = await play_dl.stream(track.url, {
            discordPlayerCompatibility: false
        });


        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.player.play(resource);
    }

    private Destroy(): void {
        this.connection.disconnect();
        this.player.stop();
        delete this.guild.queue;
        this.guild.queue = null;
    };


}