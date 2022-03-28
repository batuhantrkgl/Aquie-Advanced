import { PermissionResolvable } from "discord.js";
import mongoose from "mongoose";

export type DatabaseOptions = {
    mongoURL:string
};

export type GuildPermissions = { roles: Role[], users: User[] };

export type DefaultPermissions = {
    "AddToQueue": PermissionResolvable,
    "ViewQueue": PermissionResolvable,
    "ManagePlayer": PermissionResolvable,
    "ManageQueue": PermissionResolvable,
    "ManageServer": PermissionResolvable
};

export type Permissions = {
    "AddToQueue":boolean,
    "ViewQueue": boolean,
    "ManagePlayer": boolean,
    "ManageQueue": boolean,
    "ManageServer": boolean
};

export type Role = {
    role_id:string, 
    permissions: Permissions
};

export type User = {
    user_id:string,
    permissions:Permissions
};

export type GuildSchema = {
    guild_id:string,
    permissions: GuildPermissions
}

export type DBGuild = {
    _id: mongoose.ObjectId
    __v: 0
} & GuildSchema

export type Schemas = {
    GuildSchema:any,
}

