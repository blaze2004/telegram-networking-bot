import { SessionContext } from "../../types/telegram";
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
                await ctx.reply(...nextQuestion);
            }
            else {
                const responseList = await currentProcess.postProcessAction(ctx);
                for (let i = 0; i < responseList.length; i++) {
                    await ctx.reply(...responseList[i]);
                }
            }
        }
    } else {
        const response = await getResponse(msg_body, ctx);
        await ctx.reply(...response);
    }
}

export default getMessage;