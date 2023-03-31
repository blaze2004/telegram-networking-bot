import replies from "../../constants/replies";
import { SessionContext } from "../../types/telegram";
import prisma from "../../utils/prismaClient";
import ProcessManager from "../../utils/processManager";
import getResponse from "./getContext";

const getMessage = async (message: string, ctx: SessionContext) => {

    await ctx.sendChatAction("typing");

    const user = ctx.session.user;
    const msg_body = message.toLowerCase().trim();

    // continue if there is any ongoing process
    if (user.processId != null) {
        const currentProcess = ProcessManager.findProcess(user.processId);
        if (currentProcess === null) {
            ctx.session.user.processId = null;
        }
        else {
            const nextQuestion = await currentProcess.handleUserResponse(msg_body);
            if (nextQuestion != null) {
                return await ctx.reply(...nextQuestion);
            }
            else {
                const responseList = await currentProcess.postProcessAction(ctx);
                for (let i = 0; i < responseList.length; i++) {
                    return await ctx.reply(...responseList[i]);
                }
            }
        }
    } else {
        console.log(ctx.chat?.id);
        const currentUser = await prisma.user.findUnique({
            where: {
                chatId: ctx.chat?.id
            }
        });

        if (currentUser == null) {
            const newProcess = await ProcessManager.createProcess("onboarding", ctx);
            if (newProcess.welcomeMessage != null) {
                return await ctx.reply(...newProcess.welcomeMessage);
            }
            return await ctx.reply(...replies.welcomeMessage);
        }

        const response = await getResponse(msg_body, ctx);
        return await ctx.reply(...response);
    }
}

export default getMessage;