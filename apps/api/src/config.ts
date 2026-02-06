

export type AppConfig = {
    port:number;
}
export function loadConfig() : AppConfig {
    const port = Number(process.env) || 3000;

    return {
        port,
    };

}