import { GuildMember } from "discord.js";
import mongoose from "mongoose";
import { DatabaseOptions, DBGuild, Schemas, User, Permissions,Role } from "../Typings/database";


export class Database {

    private readonly dbURL:string;
    public readonly GuildModel:mongoose.Model<any, {}, {}, {}>;;
    public Schemas:Schemas = {"GuildSchema": null};

    constructor(options:DatabaseOptions) { 
        this.dbURL = options.mongoURL;
    
        this.Schemas.GuildSchema = new mongoose.Schema({
            guild_id: {
                type: String,
                required: true
            },
            permissions: {
                type: JSON,
                required: true,
                default: { roles: [], users: [] } 
            }
        });

        this.GuildModel = mongoose.model('guilds', this.Schemas.GuildSchema);

    }

    async getGuild(guildID: string):Promise<DBGuild | null> {
        const guild:DBGuild | any = await this.GuildModel.findOne({guild_id: guildID});
        return guild == undefined ? null : guild;
    }

    addGuild(guildID: string): void {
        new this.GuildModel(
            {
                guild_id: guildID,
                permissions: { roles: [], users: []}
            }
        ).save();
    }
    async removeGuild(guildID: string): Promise<void> {
        await this.GuildModel.deleteOne({guild_id: guildID});
    }

    async Guilds():Promise<DBGuild[]> {
        return (await this.GuildModel.find());
    }

    defaultPermissions(target: import("discord.js").Role | GuildMember) {
        const permissions:Permissions = {
            "AddToQueue": false,
            "ViewQueue": false,
            "ManagePlayer": false,
            "ManageQueue": false,
            "ManageServer": false
        };


        if(target.permissions.has("SEND_MESSAGES")) permissions.AddToQueue = true;
        if(target.permissions.has("SEND_MESSAGES")) permissions.ViewQueue = true;
        if(target.permissions.has("BAN_MEMBERS")) permissions.ManagePlayer = true;
        if(target.permissions.has("KICK_MEMBERS")) permissions.ManageQueue = true;
        if(target.permissions.has("ADMINISTRATOR")) permissions.ManageServer = true;

        return permissions;
    }

    async addUser(user: GuildMember) {
        const guild:DBGuild = await this.getGuild(user.guild.id); 

        const dbUser:User = {
            user_id: user.id,
            permissions: this.defaultPermissions(user)
        };
        
        guild.permissions.users.push(dbUser);

        await this.GuildModel.updateOne({guild_id: user.guild.id}, { permissions: guild.permissions });
        
    }

    async addRole(role: import("discord.js").Role) {
         const guild:DBGuild = await this.getGuild(role.guild.id); 

    
         const dbRole:Role = {
            role_id: role.id,
            permissions: this.defaultPermissions(role)
         };

         guild.permissions.roles.push(dbRole);
         
         await this.GuildModel.updateOne({guild_id: role.guild.id}, { permissions: guild.permissions });
        
    }

    async getRole(role: import("discord.js").Role): Promise<Role | null> {
        const { roles } = (await this.getGuild(role.guild.id)).permissions;
        for(const dbRole of roles) {
            if(role.id != dbRole.role_id) return;
            return dbRole;
        }
        return null;
    }

    async getUser(user: GuildMember): Promise<User | null> {
        const { users } = (await this.getGuild(user.guild.id)).permissions;
        for(const dbUser of users) {
            if(user.id != dbUser.user_id) return;
            return dbUser;
        }
        return null;
    };

    async removeRole(role: import("discord.js").Role): Promise<void> {
        const guild:DBGuild = await this.getGuild(role.guild.id); 

        const roleIndex:number = guild.permissions.roles.map((r, index) => {if(r.role_id == role.id) return index; })[0];
        guild.permissions.roles.splice(roleIndex, 1);

        await this.GuildModel.updateOne({guild_id: role.guild.id}, { permissions: guild.permissions });
    }
    
    async removeUser(user: GuildMember): Promise<void> {
        const guild:DBGuild = await this.getGuild(user.guild.id); 

        const userIndex:number = guild.permissions.users.map((r, index) => {if(r.user_id == user.id) return index; })[0];
        guild.permissions.users.splice(userIndex, 1);
        await this.GuildModel.updateOne({guild_id: user.guild.id}, { permissions: guild.permissions });
    }

    

    async connect() {
        const connect:typeof mongoose = await mongoose.connect(this.dbURL);
        return connect;
    }
}