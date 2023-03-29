import { config } from "dotenv";

if (process.env.NODE_ENV != "production") {
    config();
}

const environmentVariables = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "8000"),
    telegramBotAccessToken: process.env.TELEGRAM_BOT_ACCESS_TOKEN as string,
    databaseConnectionString: process.env.DATABASE_CONNECTION_STRING as string,
    domain: process.env.DOMAIN as string,
}

export default environmentVariables;