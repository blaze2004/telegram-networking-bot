import { User } from "@prisma/client";
import replies, { connectionActionMarkup } from "../../constants/replies";
import { BotResponseMessage } from "../../types";
import { SessionContext } from "../../types/telegram";
import { escapeMarkdownV2 } from "../../utils/messageBuilder";
import prisma from "../../utils/prismaClient";

const findHighlyMatchedUser=async (currentUser: User): Promise<User> => {
    // Find users who have at least one matching interest and are not in the rejected or viewed arrays
    const matchedUsers=await prisma.user.findMany({
        where: {
            id: {
                notIn: [...(currentUser.rejected), ...(currentUser.viewed)],
            },
            interests: {
                hasSome: currentUser.interests,
            },
        },
        take: 10
    })

    // Sort the matched users by the number of matching interests in descending order
    const sortedUsers=matchedUsers.sort((a, b) => {
        const aMatchingInterests=a.interests.filter((interest) =>
            currentUser.interests.includes(interest)
        )
        const bMatchingInterests=b.interests.filter((interest) =>
            currentUser.interests.includes(interest)
        )
        return bMatchingInterests.length-aMatchingInterests.length
    })

    // Return the user with the most matching interests, or any user not in the viewed or rejected arrays if no matching user is found
    return sortedUsers[0]??prisma.user.findFirst({
        where: {
            id: {
                notIn: [...(currentUser.rejected), ...(currentUser.viewed)],
            },
        },
    })
}

export const findConnection=async (ctx: SessionContext): Promise<BotResponseMessage> => {
    try {
        const currentUser=await prisma.user.findUnique({
            where: {
                chatId: ctx.chat?.id
            }
        });

        if (currentUser!=null) {
            const connection=await findHighlyMatchedUser(currentUser);
            currentUser.viewed.push(connection.id)
            await prisma.user.update({
                where: {
                    id: currentUser.id
                },
                data: {
                    viewed: currentUser.viewed
                }
            })
            return [
                `${escapeMarkdownV2("I found a potential connection for you😁.\n")}
                *Name:* ${escapeMarkdownV2(connection.name)}
                *About:* ${escapeMarkdownV2(connection.bio)}
                *LinkedIn:* ${connection.linkedin}
                *Interests:* ${escapeMarkdownV2(connection.interests.join(", "))}\n
                What would you like to do next?`,
                connectionActionMarkup];
        }

        return replies.serverErrorMessage;
    } catch (error: any) {
        console.log("Error finding connection", error);
        return replies.serverErrorMessage;
    }
};

export default findConnection;