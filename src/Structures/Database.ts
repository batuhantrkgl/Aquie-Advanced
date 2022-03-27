import mongoose from "mongoose";
import { DatabaseOptions, DBGuild, Schemas } from "../typings/database";

export class Database {

    private readonly dbURL:string;
    private readonly GuildModel:mongoose.Model<any, {}, {}, {}>;;
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
        const guild:DBGuild = await this.GuildModel.findOne({guild_id: guildID});
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
    async connect() {
        const connect:typeof mongoose = await mongoose.connect(this.dbURL);
        return connect;
    }
}