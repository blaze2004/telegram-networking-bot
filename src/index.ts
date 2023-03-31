import { randomUUID } from "crypto";
import { Telegraf, session } from "telegraf";
import { message } from 'telegraf/filters';
import { chatWithConnection, ignoreConnection, sendConnectionRequest } from "./actions/conversation/connections";
import getMessage from "./actions/conversation/getMessage";
import { SessionContext } from "./types/telegram";
import environmentVariables from "./utils/config";

const bot = new Telegraf<SessionContext>(environmentVariables.telegramBotAccessToken);
bot.use(session({ defaultSession: () => ({ user: {} }) }));

bot.use((ctx, next) => {
    if (ctx.session.user.username === undefined) {
        ctx.session.user = {
            name: ctx.message?.from.first_name,
            username: ctx.message?.from.username || randomUUID(),
            processId: null,
        }
    }
    next();
})

bot.start(async (ctx) => {
    await getMessage("hi", ctx);
});

bot.on(message("text"), async (ctx) => {
    console.log(ctx.session);
    await getMessage(ctx.message.text, ctx);
});

bot.action("find_connection", async (ctx) => {
    await getMessage("find_connection", ctx);
});

bot.action("show_requests", async (ctx) => {
    await getMessage("show_requests", ctx);
});

bot.action("update_interests", async (ctx) => {
    await getMessage("update_interests", ctx);
});

bot.action(/^chat_with_connection_id_.*$/, chatWithConnection);

bot.action(/^send_request_id_.*$/, sendConnectionRequest);

bot.action(/^ignore_connection_id_.*$/, ignoreConnection);

if (environmentVariables.nodeEnv === "production") {
    bot.launch({
        webhook: {
            domain: environmentVariables.domain,
            port: environmentVariables.port,
        }
    });
} else {
    bot.launch();
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
