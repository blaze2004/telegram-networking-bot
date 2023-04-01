import { Update } from "telegraf/types";
import Process from ".";
import replies from "../constants/replies";
import { BotResponseMessage } from "../types";
import { SessionContext } from "../types/telegram";
import { escapeMarkdownV2, toCapitalCase, toSentenceCase } from "../utils/messageBuilder";
import prisma from "../utils/prismaClient";
import ProcessManager from "../utils/processManager";

class UserOnboarding extends Process {
    constructor(pid: string) {
        super(pid);
        this.questions = [
            {
                question: [escapeMarkdownV2("Hey,\nI'm the network bot. I will help you network with like minded community members.\n") + "*Before moving ahead, may I know your full name?*", { parse_mode: "MarkdownV2" }],
                validateAnswer: (answer: string) => answer.length > 0,
                errorMsg: ["Please enter a valid name.",],
                answer: null
            },
            {
                question: [escapeMarkdownV2("Please describe yourself in a few words."), { parse_mode: "MarkdownV2" }],
                validateAnswer: (answer: string) => answer.length > 0,
                errorMsg: ["Please provide your short intro.",],
                answer: null
            },
            {
                question: ["Your linkedIn profile please."],
                validateAnswer: this.isValidLinkedInLink.bind(this),
                errorMsg: ["Pleas provide a valid linkedin profile url."],
                answer: null
            }
        ];
    }

    async isValidLinkedInLink(linkedinLink: string): Promise<boolean> {
        const regex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/i;
        if (regex.test(linkedinLink)) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    linkedin: linkedinLink
                }
            });

            if (existingUser != null) {
                this.questions[2].errorMsg = ["This linkedin profile belongs to another user."];
                return false;
            }

            return true;
        }
        return false;
    }

    async postProcessAction(ctx: SessionContext<Update>): Promise<BotResponseMessage[]> {
        try {
            if (this.questions[0].answer && this.questions[1].answer && this.questions[2].answer) {
                const newUser = await prisma.user.create({
                    data: {
                        name: toCapitalCase(this.questions[0].answer),
                        bio: toSentenceCase(this.questions[1].answer),
                        telegramUsername: ctx.session.user.username || null,
                        linkedin: this.questions[2].answer,
                        interests: [],
                        viewed: [],
                        rejected: [],
                        chatId: ctx.chat?.id || 0
                    }
                });

                ctx.session.user.name = toCapitalCase(this.questions[0].answer);
            }

            const processEndMessage = await super.postProcessAction(ctx);
            const newProcess = await ProcessManager.createProcess("user-interests", ctx);
            if (newProcess.welcomeMessage != null) {
                return [newProcess.welcomeMessage];
            }
            return processEndMessage;
        } catch (error: any) {
            console.log("Error creating User", error);
            return [replies.serverErrorMessage];
        }
    }
}

export default UserOnboarding;