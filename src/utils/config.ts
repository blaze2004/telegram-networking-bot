import { config } from "dotenv";

if (process.env.NODE_ENV != "production") {
    config();
}

const environmentVariables = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "8000"),
    telegramBotAccessToken: process.env.TELEGRAM_BOT_ACCESS_TOKEN as string,
    databaseConnectionString: process.env.DATABASE_URL as string,
    domain: process.env.DOMAIN,
}

export default environmentVariables;
