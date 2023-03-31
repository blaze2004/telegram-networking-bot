import { User } from "@prisma/client";
import { CallbackQuery } from "telegraf/types";
import replies, { connectionActionMarkup } from "../../constants/replies";
import { BotResponseMessage } from "../../types";
import { SessionContext } from "../../types/telegram";
import { escapeMarkdownV2 } from "../../utils/messageBuilder";
import prisma from "../../utils/prismaClient";

export const chatWithConnection = async (ctx: SessionContext) => {
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    const regex = /^chat_with_connection_id_(.*)$/;
    const match = callbackData.match(regex);
    const connectionRequestId = match ? match[1] : null;

    if (connectionRequestId) {
        try {

            const connectionRequest = await prisma.requests.findUnique({
                where: {
                    id: connectionRequestId
                },
                include: {
                    sender: true,
                    receiver: true,
                }
            });

            if (connectionRequest) {
                const connection = connectionRequest.sender;
                const currentUser = connectionRequest.receiver;
                currentUser.connections.push(connection.id);
                connection.connections.push(currentUser.id);

                await prisma.user.update({
                    where: {
                        id: currentUser.id
                    },
                    data: {
                        connections: currentUser.connections
                    }
                });

                await prisma.user.update({
                    where: {
                        id: connection.id
                    },
                    data: {
                        connections: connection.connections
                    }
                });

                await prisma.requests.delete({
                    where: {
                        id: connectionRequest.id
                    }
                });

                return await ctx.reply(escapeMarkdownV2('You can now chat directly with your connection on telegram.') + `\n\n[Chat Now](tg://user?id=${connection.chatId})`,
                    { parse_mode: "MarkdownV2" }
                );
            }

            return await ctx.reply(...replies.serverErrorMessage);
        } catch (error: any) {
            console.log("Error accepting connection", error);
            return await ctx.reply(...replies.serverErrorMessage);
        }
    }
};

export const ignoreConnection = async (ctx: SessionContext) => {
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    const regex = /^ignore_connection_id_(.*)$/;
    const match = callbackData.match(regex);
    const connectionRequestId = match ? match[1] : null;

    if (connectionRequestId) {
        try {
            const connectionRequest = await prisma.requests.findUnique({
                where: {
                    id: connectionRequestId
                },
                include: {
                    receiver: true,
                }
            });

            if (connectionRequest) {
                const currentUser = connectionRequest.receiver;
                currentUser.rejected.push(connectionRequestId);

                await prisma.user.update({
                    where: {
                        id: currentUser.id
                    },
                    data: {
                        rejected: currentUser.rejected
                    }
                });

                await prisma.requests.delete({
                    where: {
                        id: connectionRequest.id
                    }
                });

                return await ctx.reply(...replies.requestIgnoredMessage);
            }

            return await ctx.reply(...replies.serverErrorMessage);
        } catch (error: any) {
            console.log("Error ignoring connection request", error);
            return await ctx.reply(...replies.serverErrorMessage);
        }
    }
};

export const sendConnectionRequest = async (ctx: SessionContext) => {
    const callbackData = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
    const regex = /^send_request_id_(.*)$/;
    const match = callbackData.match(regex);
    const connectionId = match ? match[1] : null;
    console.log(callbackData);
    console.log(connectionId)

    if (connectionId) {
        try {
            const connection = await prisma.user.findUnique({
                where: {
                    id: connectionId
                }
            });

            const currentUser = await prisma.user.findUnique({
                where: {
                    chatId: ctx.chat?.id
                }
            });

            if (connection && currentUser) {
                await prisma.requests.create({
                    data: {
                        receiverId: connection.id,
                        senderId: currentUser.id
                    }
                });

                return await ctx.reply(...replies.connectionRequestSentMessage);
            }

            return await ctx.reply(...replies.serverErrorMessage);
        } catch (error: any) {
            console.log("Error sending connection request", error);
            return await ctx.reply(...replies.serverErrorMessage);
        }
    }
};

const findHighlyMatchedUser = async (currentUser: User): Promise<User> => {
    // Find users who have at least one matching interest and are not in the rejected or viewed arrays
    const matchedUsers = await prisma.user.findMany({
        where: {
            id: {
                notIn: [...(currentUser.rejected), ...(currentUser.viewed), ...(currentUser.connections), currentUser.id],
            },
            interests: {
                hasSome: currentUser.interests,
            },
        },
        take: 5
    })

    // Sort the matched users by the number of matching interests in descending order
    const sortedUsers = matchedUsers.sort((a, b) => {
        const aMatchingInterests = a.interests.filter((interest) =>
            currentUser.interests.includes(interest)
        )
        const bMatchingInterests = b.interests.filter((interest) =>
            currentUser.interests.includes(interest)
        )
        return bMatchingInterests.length - aMatchingInterests.length
    });

    // Return the user with the most matching interests, or any user not in the viewed or rejected arrays if no matching user is found
    const bestConnection = sortedUsers[0] ?? await prisma.user.findFirst({
        where: {
            id: {
                notIn: [...(currentUser.rejected), ...(currentUser.viewed), ...(currentUser.connections), currentUser.id],
            },
        },
    });

    console.log(bestConnection);

    return bestConnection;
}

export const findConnection = async (ctx: SessionContext): Promise<BotResponseMessage> => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: {
                chatId: ctx.chat?.id
            }
        });

        if (currentUser != null) {
            const connection = await findHighlyMatchedUser(currentUser);
            if (connection === null) {
                return ["No member with matching interests found."];
            }
            currentUser.viewed.push(connection.id)
            await prisma.user.update({
                where: {
                    id: currentUser.id
                },
                data: {
                    viewed: currentUser.viewed
                }
            });
            return [
                `${escapeMarkdownV2("I found a potential connection for you😁.\n")}\n*Name:* ${escapeMarkdownV2(connection.name)}\n*About:* ${escapeMarkdownV2(connection.bio)}\n*LinkedIn:* ${escapeMarkdownV2(connection.linkedin)}\n*Interests:* ${escapeMarkdownV2(connection.interests.join(", "))}\n\nWhat would you like to do next?`,
                connectionActionMarkup(connection.id)];
        }

        return replies.serverErrorMessage;
    } catch (error: any) {
        console.log("Error finding connection", error);
        return replies.serverErrorMessage;
    }
};

export default findConnection;