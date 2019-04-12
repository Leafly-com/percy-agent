"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const fs = require("fs");
class ProcessService {
    runDetached(args) {
        if (this.isRunning()) {
            return;
        }
        const logFile = fs.openSync(ProcessService.LOG_PATH, 'a+');
        const spawnedProcess = childProcess.spawn(process.argv[0], args, {
            detached: false,
            stdio: ['ignore', logFile, logFile],
        });
        this.writePidFile(spawnedProcess.pid);
        spawnedProcess.unref();
        return spawnedProcess.pid;
    }
    isRunning() {
        return fs.existsSync(ProcessService.PID_PATH);
    }
    getPid() {
        const pidFileContents = fs.readFileSync(ProcessService.PID_PATH);
        return parseInt(pidFileContents.toString('utf8').trim());
    }
    kill() {
        if (this.isRunning()) {
            const pid = this.getPid();
            fs.unlinkSync(ProcessService.PID_PATH);
            process.kill(pid, 'SIGHUP');
        }
    }
    writePidFile(pid) {
        fs.writeFileSync(ProcessService.PID_PATH, pid);
    }
}
ProcessService.PID_PATH = './.percy.pid';
ProcessService.LOG_PATH = './percy-process.log';
exports.default = ProcessService;
