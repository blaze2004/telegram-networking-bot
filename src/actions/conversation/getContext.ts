import replies, { getGreetingsResponse } from "../../constants/replies";
import { BotResponseMessage } from "../../types";
import { SessionContext } from "../../types/telegram";
import ProcessManager from "../../utils/processManager";
import findConnection from "./connections";
import showRequests from "./requests";

const getContext = (message: string): string | null => {
    const greetingRegexes = [
        /^(hi|hello|hey)( there|).*$|^.*?(hi|hello|hey).*$|^.*(hi|hello|hey)[,.!]?$/i,
        /^(good )?(morning|afternoon|evening)( there|).*?$|^.*?(good )?(morning|afternoon|evening)( there|).*?$/i,
        /^(hi|hello|hey).*?[,.!]*$/i,
        /^(hey|hi|hello)\s+(man|dude|buddy)[,.!]*$/i,
    ];

    const appreciationRegexes = [
        /^(thanks|thank you|thx).*?[,.!]*$/i,
        /^(i )?(really )?appreciate(d)? it.*?[,.!]*$/i,
        /^(you )?(are )?(the )?(best|awesome|amazing).*?[,.!]*$/i,
    ];

    const stopRegex = /^(will )?(chat|speak|talk)( later| soon| tomorrow)?|^(see you|bye|goodbye)( later| soon)?|^stop.*?$/i;

    const connectionSearchRegex = /^(find|show|search)[ _]?(my)?[ _]?connections?$/i;

    const updateInterestsRegex = /^(update[_ ])?interests$/i;

    const showRequestsRegex = /^(show|display|view|see)\s*(my)?\s*(connection )?(requests|invitations|pending)?$/i;

    if (message === "update_interests" || updateInterestsRegex.test(message)) {
        return "update_interests";
    }

    if (message === "find_connection" || connectionSearchRegex.test(message)) {
        return "find_connection";
    }

    if (message === "show_requests" || showRequestsRegex.test(message)) {
        return "show_requests";
    }

    for (const regex of greetingRegexes) {
        if (regex.test(message))
            return "greeting";
    }

    for (const regex of appreciationRegexes) {
        if (regex.test(message))
            return "appreciation";
    }

    if (stopRegex.test(message))
        return "stop";

    return null;
}

const getResponse = async (message: string, ctx: SessionContext): Promise<BotResponseMessage> => {

    const context = getContext(message);

    switch (context) {
    case "greeting": return getGreetingsResponse(ctx.session.user.name || "There");
    case "appreciation": return replies.appreciationMessage;
    case "stop": return replies.chatLaterMessage;
    case "update_interests": {
        const newProcess = await ProcessManager.createProcess("user-interests", ctx);
        if (newProcess.welcomeMessage != null) {
            return newProcess.welcomeMessage;
        }
        return replies.welcomeMessage;
    }
    case "find_connection": return await findConnection(ctx);
    case "show_requests": return await showRequests(ctx);
    default: return replies.invalidInputMessage;
    }
}

export default getResponse;