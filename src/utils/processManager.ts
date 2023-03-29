import { randomUUID } from "crypto";
import Process from "../process";
import FeedSearch from "../process/feed";
import { SessionContext } from "../types/telegram";

class ProcessManager {
    static processes: Process[] = [];

    static async createProcess(processType: string, ctx: SessionContext) {
        let process = null;
        const processId = randomUUID();
        if (processType === "feed-search") {
            process = new FeedSearch(processId);
        } else {
            process = new FeedSearch(processId);
        }
        ctx.session.user.processId = process.pid;

        ProcessManager.processes.push(process);
        return process;
    }

    static findProcess(pid: string) {
        return ProcessManager.processes.find(p => p.pid === pid) || null;
    }

    static destroyProcess(pid: string, ctx: SessionContext) {
        const pIndex = ProcessManager.processes.findIndex(p => p.pid === pid);
        const removedProcess = ProcessManager.processes.splice(pIndex, 1);

        if (ctx.session.user.processId === pid) {
            ctx.session.user.processId = null;
        }

        return removedProcess;
    }
}

export default ProcessManager;