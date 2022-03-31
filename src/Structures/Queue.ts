import play_dl, { YouTubeVideo } from "play-dl";
import { VoiceBasedChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioResource, joinVoiceChannel,NoSubscriberBehavior,VoiceConnection } from '@discordjs/voice';
import { AquieClient } from "./Client";
import { Track } from "../Typings/player";


export class Queue {

    public readonly tracks:Track[];
    private connection:VoiceConnection | null;
    public playing:false | true;
    public client: AquieClient;
    public player:AudioPlayer;
    public current:number;

    constructor(client: AquieClient) {
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

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playing = false;
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

    addTrack(track: Track): Track {
        this.tracks.push(track);
        return track;
    }

    nowPlaying():Track | null {
        return this.tracks[this.current] || null;
    }

    async play(){
        
        this.playing = true;
        const stream = await play_dl.stream(this.nowPlaying()?.url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.player.play(resource);
        this.connection.subscribe(this.player);
    }

}