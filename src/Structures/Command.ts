import { CommandType } from "../Typings/client";

export class Command {
    constructor(commandOptions:CommandType){
        Object.assign(this, commandOptions);
    }
}