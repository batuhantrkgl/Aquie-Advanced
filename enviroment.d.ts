declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            mongoURL: string;
            INVITE_LINK: string;
            GUILD: string;
            RPC_CLIENT_ID: string;
        }
    }
}

export { };