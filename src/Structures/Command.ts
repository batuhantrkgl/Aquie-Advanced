import { CommandType } from "../typings/client";

export class Command {
    constructor(commandOptions:CommandType){
        Object.assign(this, commandOptions);
    }
}