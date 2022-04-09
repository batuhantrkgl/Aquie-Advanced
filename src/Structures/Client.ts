import { ApplicationCommand, Client, ClientEvents, Collection, Guild, GuildMember, PermissionResolvable } from "discord.js";
import { AquieClientOptions, CommandType, PermissionsString } from '../Typings/client';
import { Event } from "./Event";
import { Database } from './Database';
import fs from 'fs';
import "dotenv/config";
import { DBGuild,Role } from "../Typings/database";
import { Player } from "./Player";

export class AquieClient extends Client {

    public readonly commands: Collection<string, CommandType>
    public readonly db:Database;
    public readonly player: Player;
    public readonly guildInvite: string;
    public inviteURL:string;
    constructor(options: AquieClientOptions) {
        super(options);
        this.token = options.token;
        this.commands = new Collection();
        this.db = new Database({mongoURL: process.env.mongoURL});
        this.player = new Player(this);
        this.inviteURL = process.env.INVITE_LINK;
        this.guildInvite = process.env.GUILD;
    }

    public log(message: string): void {
        console.log(`\x1b[42m[Client]\x1b[0m : ${message}`);
    }
    public error(message:string): void {
        console.log(`\x1b[41m[Client]\x1b[0m : ${message}`);
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

    public async checkPermission(author: GuildMember, permission: PermissionsString) {
        if(author.id == author.guild.ownerId) return true;
        if(permission == "Default") return true;

        const dbGuild:DBGuild = await this.db.getGuild(author.guild.id);

        const defaultPermCheck = ():boolean => {
            return author.permissions.has(
                permission.replace(
                    "AddToQueue","SEND_MESSAGES").replace(
                    "ViewQueue", "SEND_MESSAGES").replace(
                    "ManagePlayer", "KICK_MEMBERS").replace(
                    "ManageQueue", "BAN_MEMBERS").replace(
                    "ManageServer", "ADMINISTRATOR" 
                ) as PermissionResolvable
            );
        }

        const userPermCheck = ():boolean | undefined => {
            const dbUser = dbGuild.permissions.users.find((value) => value.user_id == author.id);
            if(!dbUser) return undefined;
            if(dbUser["permissions"][permission]) return true;
            return false;
        }

        const rolePermCheck = ():boolean | undefined => {
            const dbRoles = dbGuild.permissions.roles.map((role) => role);
            let setRoles:Role[] = [];

            for(const role of dbRoles) {
                if(author.roles.cache.has(role.role_id)) setRoles.push(role);
            }

            const sortRole:Role[] = [];
            setRoles.map((dbRole) => author.roles.cache.get(dbRole.role_id)).sort((a, b) => b.position - a.position).map((r) => r).map((role) => {
                setRoles.map((dbRole) => {if(dbRole.role_id == role.id) { sortRole.push(dbRole); }})
            });

            let i = 0;
            for(const role of sortRole) {
                i++;
                if(role.permissions[permission]) return true;
                if(sortRole.length != i) continue;
                return false;
            }
        }

        if(userPermCheck() != undefined) { return userPermCheck() }
        else if(rolePermCheck() != undefined) { return rolePermCheck()};
        return defaultPermCheck();
        
    }

    public async Run(): Promise<void> {
        await this.db.connect().then(() => this.log("Connected to Database")).catch((e) => { this.error("Not Connected To Database"); process.exit(0) });
        this.loadModules();
        await this.login(this.token);
    };

}