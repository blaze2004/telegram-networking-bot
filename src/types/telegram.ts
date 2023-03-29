import type { Update } from "telegraf/types";
import type { Context } from "telegraf"
import { User } from ".";

export interface SessionContext<U extends Update = Update> extends Context<U> {
    session: {
        user: User;
    },
}