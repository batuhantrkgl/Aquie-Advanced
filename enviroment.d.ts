declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN:string;
            mongoURL:string;
            INVITE_LINK:string;
            GUILD: string;
        }
    }
}

export {};