import { InlineKeyboardButton, ParseMode } from "telegraf/types";
import { BotResponseMessage } from "../types";
import { escapeMarkdownV2 } from "../utils/messageBuilder";

export const getGreetingsResponse=(name: string): BotResponseMessage => {
    const greetingsResponse=[
        `Hi ${name},\nHow can I assist you today?`,
        `Hello ${name}!,\nIt's great to hear from you.\n\nHow can I help you?`,
        `Hey ${name},\nHow can I help you?`,
        `Hi ${name},\nWhat would you like me to do?*`,
    ];

    return [escapeMarkdownV2(greetingsResponse[1]), chatStarterMarkup];
}

const chatStarterMarkup: { reply_markup: { inline_keyboard: InlineKeyboardButton[][] }, parse_mode: ParseMode }={
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Find Connections",
                    callback_data: "find_connection"
                },
            ],
            [
                {
                    text: "Show Requests",
                    callback_data: "show_requests"
                }
            ],
            [
                {
                    text: "Update Interests",
                    callback_data: "update_interests"
                }
            ]
        ]
    },
    parse_mode: "MarkdownV2"
}

export const connectionActionMarkup: { reply_markup: { inline_keyboard: InlineKeyboardButton[][] }, parse_mode: ParseMode }={
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Let's Connect",
                    callback_data: "send_request"
                }
            ],
            [
                {
                    text: "Find Connection",
                    callback_data: "find_connection"
                },
            ]
        ]
    },
    parse_mode: "MarkdownV2"
}

const appreciationResponse=[
    "You're welcome! It's my pleasure to assist you.\n\nHow can I help you?",
    "Thank you for your kind words! It's always great to hear positive feedback.\n\nHow can I help you?",
    "Glad I could help! Let me know if you need anything else.",
    "It's my pleasure to serve you!\n\nHow can I help you?",
    "Thanks for the appreciation.\n\nHow can I help you?",
    "I am glad you like the results.\n\nHow can I help you?"
];

const unrecognizedResponses=[
    "I'm sorry, I didn't quite catch that.",
    "I'm still learning, can you try again with simpler words?",
    "I'm not sure how to respond to that.",
    "I'm afraid I don't have an answer for that.",
    "I'm not sure how to respond to that.",
    "I'm sorry, I did't understand that.",
];

const replies: { [key: string]: BotResponseMessage }={
    welcomeMessage: [escapeMarkdownV2("What would you like to do now?"), chatStarterMarkup],
    invalidInputMessage: [escapeMarkdownV2(unrecognizedResponses[Math.floor(Math.random()*unrecognizedResponses.length)]), chatStarterMarkup],
    appreciationMessage: [escapeMarkdownV2(appreciationResponse[Math.floor(Math.random()*appreciationResponse.length)]), chatStarterMarkup],
    chatLaterMessage: [escapeMarkdownV2("Sure, I'll be here if you need me."), { parse_mode: "MarkdownV2" }],
    interestsUpdatedMessage: [escapeMarkdownV2("I have updated your interests.\n\nWhat do you want to do next?"), chatStarterMarkup],
    serverErrorMessage: ["Oops, there was some issue on my server, can you please try again."],
}

export default replies;