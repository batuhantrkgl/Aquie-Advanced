import play_dl from "play-dl";
import { Message, TextBasedChannel, VoiceBasedChannel } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, createAudioResource, joinVoiceChannel,NoSubscriberBehavior,VoiceConnection } from '@discordjs/voice';
import { AquieClient } from "./Client";
import { Track } from "../Typings/player";
import { QueueOptions } from "../Typings/queue";
import { NowPlayingEmbed } from "../Functions/Embed";


export class Queue {

    public readonly tracks:Track[];
    private connection:VoiceConnection | null;
    public playing:false | true;
    public client: AquieClient;
    public player:AudioPlayer;
    public current:number;
    private textChannel: TextBasedChannel | null;
    public npMessage:Message<boolean>;

    constructor(client: AquieClient, options:QueueOptions) {
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

    
    addTrack(track: Track): Track {
        this.tracks.push(track);
        return track;
    }

    nowPlaying():Track | null {
        return this.tracks[this.current] || null;
    }

    async nowPlayingMessage():Promise<void> {
        try {
            if(this.npMessage) this.npMessage.delete();
            this.npMessage = await this.textChannel.send({embeds: [NowPlayingEmbed(this.nowPlaying().title)]}) ;
        } catch { return; }
    }

    Stop() {
        this.player.stop();
    }

    Skip() {
        if(this.playing) {
            this.player.stop();
            return;
        }
        this.current++;
        if(this.nowPlaying() == null) return this.Stop();
        this.nowPlayingMessage();
        this.Play();
    }

    async Play(){
        
        this.playing = true;
        const stream = await play_dl.stream(this.nowPlaying()?.url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        this.player.play(resource);
        this.connection.subscribe(this.player);
    }

}