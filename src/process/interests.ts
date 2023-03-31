import { Update } from "telegraf/types";
import Process from ".";
import replies from "../constants/replies";
import { BotResponseMessage } from "../types";
import { SessionContext } from "../types/telegram";
import { escapeMarkdownV2 } from "../utils/messageBuilder";
import prisma from "../utils/prismaClient";

class UserInterests extends Process {
    constructor(pid: string) {
        super(pid);
        this.questions=[
            {
                question: [escapeMarkdownV2("Please provide up to three interests separated by comma."), { parse_mode: "MarkdownV2" }],
                validateAnswer: (answer: string) => answer.split(",").length>0,
                errorMsg: ["Please provide your interests.",],
                answer: null
            },
        ];
    }

    async postProcessAction(ctx: SessionContext<Update>): Promise<BotResponseMessage[]> {
        try {
            if (this.questions[0].answer) {
                const interests=this.questions[0].answer.split(",");
                for (let i=0; i<interests.length; i++) {
                    interests[i]=interests[i].toLocaleLowerCase().trim();
                }
                const newUser=await prisma.user.update({
                    data: {
                        interests: interests
                    },
                    where: {
                        chatId: ctx.chat?.id // to be updated
                    }
                });
            }

            await super.postProcessAction(ctx);

            return [];
        } catch (error: any) {
            console.log("Error updating interests", error);
            return [replies.serverErrorMessage];
        }
    }
}

export default UserInterests;