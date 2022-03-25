import { Client } from "discord.js";
import { AquieClientOptions } from '../typings/client';

export class AquieClient extends Client {

    constructor(options:AquieClientOptions) {
        super(options);
        this.token = options.token;
    }

    Run() {
        this.login(this.token);
    }
}