import replies, { requestActionMarkup } from "../../constants/replies";
import { SessionContext } from "../../types/telegram";
import prisma from "../../utils/prismaClient";
import { escapeMarkdownV2 } from "../../utils/messageBuilder";
import { BotResponseMessage } from "../../types";

export const showRequests = async (ctx: SessionContext): Promise<BotResponseMessage> => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                chatId: ctx.chat?.id
            },
            include: {
                requestsReceived: {
                    take: 1,
                    include: {
                        sender: true
                    }
                }
            }
        });

        if (currentUser != null) {
            if (currentUser.requestsReceived[0]) {
                const connection = currentUser.requestsReceived[0].sender;
                return [
                    `${escapeMarkdownV2(`You received connection request from ${connection.name}.`)}\n*Name:* ${escapeMarkdownV2(connection.name)}\n*About:* ${escapeMarkdownV2(connection.bio)}\n*LinkedIn:* ${escapeMarkdownV2(connection.linkedin)}\n*Interests:* ${escapeMarkdownV2(connection.interests.join(", "))}\n\nWhat would you like to do next?`,
                    requestActionMarkup(currentUser.requestsReceived[0].id)
                ];
            }
            return replies.noRequestsMessage;
        }
        return replies.serverErrorMessage;
    } catch (error: any) {
        console.log("Error fetching requests", error);
        return replies.serverErrorMessage;
    }
}

export default showRequests;