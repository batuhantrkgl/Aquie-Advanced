import { Client, ClientEvents, Collection } from "discord.js";
import { AquieClientOptions, CommandType } from '../typings/client';
import { Event } from "./Event";
import fs from 'fs';

export class AquieClient extends Client {

    public commands:Collection<string, CommandType>
    public commandArray:CommandType[];

    constructor(options:AquieClientOptions) {
        super(options);
        this.token = options.token;
        this.commands = new Collection();
        this.commandArray = [];
    }

    public log(message:string):void {
        console.log(`[Client] : ${message}`);
    }
    /**
     * It imports by default.
     * @param {string} path 
     * @returns 
    */
     private async importFile(path:string):Promise<any> {
        return(await import(path))?.default;
    }

    private async loadModules() {
        /*
            Event Handler
        */
        const eventFolders = fs.readdirSync("./src/Events/");
        
        for(const folder of eventFolders) {
            const files = fs.readdirSync(`./src/Events/${folder}`);

            for(const file of files) {
                const event:Event<keyof ClientEvents> = await this.importFile(`../Events/${folder}/${file}`);

                this.on(event.name, event.run);
            }
        }
        /*
            Command Handler
        */
            const commandFolders = fs.readdirSync("./src/Commands/");
        
            for(const folder of commandFolders) {
                const files = fs.readdirSync(`./src/Commands/${folder}`);
    
                for(const file of files) {
                    const command:CommandType = await this.importFile(`../Commands/${folder}/${file}`);

                    this.commands.set(command.name, command);
                    this.commandArray.push(command);
                }
            }


    }
    public Run() {
        this.loadModules();
        this.login(this.token);
    }
}