import { InlineKeyboardButton } from "telegraf/types";

export const toCapitalCase = (str: string): string => {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, function (char) {
        return char.toUpperCase();
    });
}

export const escapeMarkdownV2 = (text: string): string => {
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    let escapedText = '';
    for (let i = 0; i < text.length; i++) {
        if (specialChars.includes(text[i])) {
            escapedText += `\\${text[i]}`;
        } else {
            escapedText += text[i];
        }
    }
    return escapedText;
}

export const telegramButtonMessage = (message: string, inline_keyboard: InlineKeyboardButton[][]) => {
    return {
        response: message,
        markup: {
            reply_markup: {
                inline_keyboard: inline_keyboard
            }
        }
    }
}

export const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
