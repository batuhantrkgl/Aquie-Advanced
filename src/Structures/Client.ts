import { Client, ClientEvents } from "discord.js";
import { AquieClientOptions } from '../typings/client';
import { Event } from "./Event";
import fs from 'fs';

export class AquieClient extends Client {

    constructor(options:AquieClientOptions) {
        super(options);
        this.token = options.token;
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

    }
    public Run() {
        this.loadModules();
        this.login(this.token);
    }
}