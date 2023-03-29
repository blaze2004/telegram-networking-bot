import { ForceReply, InlineKeyboardMarkup, ParseMode, ReplyKeyboardMarkup, ReplyKeyboardRemove } from "telegraf/types";

export interface Question {
    question: BotResponseMessage;
    answer: string | null;
    errorMsg?: BotResponseMessage;
    validateAnswer: (answer: string) => Promise<boolean> | boolean;
}

export interface User {
    name?: string;
    username: string;
    processId: string | null;
}

export type BotResponseMessage = [
    string,
    {
        reply_markup?: InlineKeyboardMarkup|ReplyKeyboardMarkup|ReplyKeyboardRemove|ForceReply;
        parse_mode?: ParseMode;
    }?
];