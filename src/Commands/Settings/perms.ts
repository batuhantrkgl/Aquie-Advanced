import { GuildMember, GuildMemberManager, Role } from "discord.js";
import { client } from "../..";
import { Command } from "../../Structures/Command";
import { PermissionsString } from "../../typings/client";
import { Permissions } from "../../typings/database";

export default new Command({
    name: "perms",
    description: "Modifies the permissions for a role or user",
    permissions: "ManageServer",
    options: [
        {
            name: "view",
            description: "Displays the currently set permissions for the role or user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "role",
                    description: "Select A Role",
                    type: "ROLE",
                    required: false,
                },
                {
                    name: "user",
                    description: "Select A User",
                    type: "USER",
                    required: false
                }
            ]
        },
        {
            name: "modify",
            description: "Modifies the permissions for a role or user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "permission",
                    description: "Select A Permission",
                    type: "STRING",
                    required: true,
                    choices: [
                        {
                            name: "Add To Queue",
                            value: "AddToQueue"
                        },
                        {
                            name: "View Queue",
                            value: "ViewQueue"
                        },
                        {
                            name: "Manage Player",
                            value: "ManagePlayer"
                        },
                        {
                            name: "Manage Queue", 
                            value: "ManageQueue"
                        },
                        {
                            name: "Manage Server",
                            value: "ManageServer"
                        }
                    ]
                },
                {
                    name: "settings",
                    description: "ALLOW or DENY or CLEAR",
                    type: "STRING",
                    required: true,
                    choices: [
                        {
                            name: "allow",
                            value: "allow"
                        },
                        {
                            name: "deny",
                            value: "deny"
                        },
                        {
                            name: "clear",
                            value: "clear"
                        }
                    ]
                },
                {
                    name: "role",
                    description: "Select A Role",
                    type: "ROLE"
                },
                {
                    name: "user",
                    description: "Select A User",
                    type: "USER"
                }
            ]
        }
    ],
    run: async({ interaction }) => {

        const permsView = async(target: Role | GuildMember) => {
            let permissions:Permissions;
            let config: {name:string, avatarURL:string} = {name:null, avatarURL:null};

            if(target instanceof Role) {
                const dbRole = await client.db.getRole(target);
                
                if(dbRole == null) permissions = client.db.defaultPermissions(target);
                else permissions = dbRole.permissions;
                config.name = target.name;
                config.avatarURL = target.iconURL() || null;
            }
            else if(target instanceof GuildMember) {
                const dbRole = await client.db.getUser(target);
                if(dbRole == null) permissions = client.db.defaultPermissions(target);
                else permissions = dbRole.permissions;
                config.name = target.user.tag;
                config.avatarURL = target.user.displayAvatarURL();
            }
            interaction.followUp({embeds: [{
                author: {
                    name: `${config.name}'s Permissions`,
                    iconURL: config.avatarURL,
                },
                color: "WHITE",
                description: Object.keys(permissions).map((key, index) => {
                    const values = Object.values(permissions);
                    if(values[index] == true) { return `**▫️ \`\` ${key} \`\`**`; }
                }).join("\n")
            }]});
            return;
        };
        const permsModify = async(target: Role | GuildMember, operation: "allow" | "deny" | "clear", permission:PermissionsString) => {
            const dbPermissions = (await client.db.getGuild(interaction.guildId)).permissions;

            if(target instanceof Role) {
                let dbRole = await client.db.getRole(target);
                if(!dbRole) { 
                    await client.db.addRole(target); 
                    dbRole = await client.db.getRole(target);
                }

                if(operation == "allow") dbRole.permissions[permission] = true;
                else if(operation == "deny") dbRole.permissions[permission] = false;
                else {
                    client.db.removeRole(target).then(() => {
                        interaction.followUp({embeds: [{description: "**▫️ Permissions Cleared.**", color: "WHITE"}]});
                    }).catch((e) => console.log(e));
                    return;
                }

                if(!dbPermissions.roles.map((r) => r.role_id).includes(target.id)) dbPermissions.roles.push(dbRole);
                else { 
                    const roleIndex:number = dbPermissions.roles.map((role, index) => {if(role.role_id == target.id) return index; })[0];
                    dbPermissions.roles[roleIndex] = dbRole;
                }

                await client.db.GuildModel.updateOne({guild_id: interaction.guildId}, {permissions: dbPermissions}).then(() => {
                    interaction.followUp({embeds: [{
                        description: `**▫️ ${target}'s permissions are set**`,
                        color: "WHITE"
                    }]});
                }).catch((e) => console.log(e));
                return;
            }
            //USER
            else if(target instanceof GuildMember) {
                let dbUser = await client.db.getUser(target);
                if(!dbUser) { 
                    await client.db.addUser(target); 
                    dbUser = await client.db.getUser(target);
                }
                
                if(operation == "allow") dbUser.permissions[permission] = true;
                else if(operation == "deny") dbUser.permissions[permission] = false;
                else {
                    client.db.removeUser(target).then(() => {
                        interaction.followUp({embeds: [{description: "**▫️ Permissions Cleared.**", color: "WHITE"}]});
                    }).catch((e) => console.log(e));
                    return;
                }

                if(!dbPermissions.users.map((r) => r.user_id).includes(target.id)) dbPermissions.users.push(dbUser);
                else { 
                    const userIndeex:number = dbPermissions.users.map((user, index) => {if(user.user_id == target.id) return index; })[0];
                    dbPermissions.users[userIndeex] = dbUser;
                }

                await client.db.GuildModel.updateOne({guild_id: interaction.guildId}, {permissions: dbPermissions}).then(() => {
                    interaction.followUp({embeds: [{
                        description: `**▫️ ${target}'s permissions are set**`,
                        color: "WHITE"
                    }]});
                }).catch((e) => console.log(e));
                return;
            }
        }

        const target = () => {
            const target = interaction.options.getRole("role") as Role || interaction.options.getMember("user") as GuildMember;
            if(!target) return interaction.followUp({embeds: [{
                description: `**❔ Select A \`\`<Role or User>\`\`**`,
                color: "WHITE"
            }]});
            return target;
        }
        switch(interaction.options.getSubcommand()) {
            case "view": 
                await permsView(target() as Role | GuildMember);
                break;
            case "modify":
                permsModify(target() as Role | GuildMember, interaction.options.getString("settings") as "allow" | "deny" | "clear", interaction.options.getString("permission") as PermissionsString);
                break;
            
        }
    },  
})