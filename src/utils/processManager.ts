import { randomUUID } from "crypto";
import Process from "../process";
import UserInterests from "../process/interests";
import UserOnboarding from "../process/onboarding";
import { SessionContext } from "../types/telegram";

class ProcessManager {
    static processes: Process[]=[];

    static async createProcess(processType: string, ctx: SessionContext) {
        let process=null;
        const processId=randomUUID();
        if (processType==="onboarding") {
            process=new UserOnboarding(processId);
        } else if (processType==="user-interests") {
            process=new UserInterests(processId);
        } else {
            process=new UserOnboarding(processId);
        }
        ctx.session.user.processId=process.pid;

        ProcessManager.processes.push(process);
        return process;
    }

    static findProcess(pid: string) {
        return ProcessManager.processes.find(p => p.pid===pid)||null;
    }

    static destroyProcess(pid: string, ctx: SessionContext) {
        const pIndex=ProcessManager.processes.findIndex(p => p.pid===pid);
        const removedProcess=ProcessManager.processes.splice(pIndex, 1);

        if (ctx.session.user.processId===pid) {
            ctx.session.user.processId=null;
        }

        return removedProcess;
    }
}

export default ProcessManager;