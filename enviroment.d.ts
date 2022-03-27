declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN:string;
            mongoURL:string;
        }
    }
}

export {};