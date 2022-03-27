import mongoose from "mongoose";
import { DatabaseOptions } from "../typings/database";

export class Database {

    private readonly dbURL:string;

    constructor(options:DatabaseOptions) { 
        this.dbURL = options.mongoURL;
    }

    async connect() {
        const connect:typeof mongoose = await mongoose.connect(this.dbURL);
        return connect;
    }
}