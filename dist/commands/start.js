"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const path = require("path");
const constants_1 = require("../services/constants");
const health_checker_1 = require("../utils/health-checker");
const percy_command_1 = require("./percy-command");
class Start extends percy_command_1.default {
    async run() {
        await super.run();
        // If Percy is disabled or is missing a token, gracefully exit here
        if (!this.percyWillRun()) {
            this.exit(0);
        }
        const { flags } = this.parse(Start);
        const port = flags.port;
        const networkIdleTimeout = flags['network-idle-timeout'];
        if (flags.detached) {
            this.runDetached({ port, networkIdleTimeout });
        }
        else {
            await this.runAttached({ port, networkIdleTimeout });
        }
        await health_checker_1.default(port);
    }
    async runAttached(options = {}) {
        process.on('SIGHUP', async () => {
            await this.agentService.stop();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            await this.agentService.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            await this.agentService.stop();
            process.exit(0);
        });
        await this.agentService.start(options);
        this.logStart();
    }
    runDetached(options = {}) {
        const pid = this.processService.runDetached([
            path.resolve(`${__dirname}/../../bin/run`),
            'start',
            '-p', String(options.port),
            '-t', String(options.networkIdleTimeout),
        ]);
        if (pid) {
            this.logStart();
        }
        else {
            this.logger.warn('percy is already running');
        }
    }
}
Start.description = 'Starts the percy process.';
Start.hidden = true;
Start.examples = [
    '$ percy start\n' +
        `info: percy has started on port ${constants_1.default.PORT}.`,
];
Start.flags = {
    'detached': command_1.flags.boolean({
        char: 'd',
        description: 'start as a detached process',
    }),
    'network-idle-timeout': command_1.flags.integer({
        char: 't',
        default: 50,
        description: 'asset discovery network idle timeout (in milliseconds)',
    }),
    'port': command_1.flags.integer({
        char: 'p',
        default: constants_1.default.PORT,
        description: 'port',
    }),
};
exports.default = Start;
