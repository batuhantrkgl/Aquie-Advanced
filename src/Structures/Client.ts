import { ApplicationCommand, Client, ClientEvents, Collection, Guild } from "discord.js";
import { AquieClientOptions, CommandType } from '../typings/client';
import { Event } from "./Event";
import { Database } from './Database';
import fs from 'fs';
import "dotenv/config";

export class AquieClient extends Client {

    public readonly commands: Collection<string, CommandType>
    public readonly db:Database;
    constructor(options: AquieClientOptions) {
        super(options);
        this.token = options.token;
        this.commands = new Collection();
        this.db = new Database({mongoURL: process.env.mongoURL});
    }

    public log(message: string): void {
        console.log(`[Client] : ${message}`);
    }
    public error(message:string): void {
        console.log(`- [Client] : ${message}`);
    }
    /**
     * It imports by default.
     * @param {string} path 
     * @returns 
    */
    private async importFile(path: string): Promise<any> {
        return (await import(path))?.default;
    }

    private async loadModules(): Promise<void> {
        /*
            Event Handler
        */
        const eventFolders = fs.readdirSync("./src/Events/");

        for (const folder of eventFolders) {
            const files = fs.readdirSync(`./src/Events/${folder}`);

            for (const file of files) {
                const event: Event<keyof ClientEvents> = await this.importFile(`../Events/${folder}/${file}`);

                this.on(event.name, event.run);
            }
        }
        /*
            Command Handler
        */
        const commandFolders = fs.readdirSync("./src/Commands/");

        for (const folder of commandFolders) {
            const files = fs.readdirSync(`./src/Commands/${folder}`);

            for (const file of files) {
                const command: CommandType = await this.importFile(`../Commands/${folder}/${file}`);

                this.commands.set(command.name, command);

            }
        }
    }
    /**
     * 
     * @param guild 
     */
    public async registerCommands(guild: Guild): Promise<Collection<string, ApplicationCommand<{}>> | null> {
        const commandArray = this.commands.map((value) => value);
        return (await guild.commands.set(commandArray)) || null;
    }

    public async Run(): Promise<void> {
        await this.db.connect().then(() => this.log("Connected to Database")).catch((e) => { this.error("Not Connected To Database"); process.exit(0) });
        this.loadModules();
        await this.login(this.token);
    }
}