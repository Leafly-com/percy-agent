"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const constants_1 = require("../services/constants");
const health_checker_1 = require("../utils/health-checker");
class HealthCheck extends command_1.Command {
    async run() {
        const { flags } = this.parse(HealthCheck);
        const port = flags.port;
        await health_checker_1.default(port, {
            shouldRetry: () => false,
        });
    }
}
HealthCheck.description = 'Determines if the Percy Agent process is currently running';
HealthCheck.hidden = true;
HealthCheck.flags = {
    port: command_1.flags.integer({
        char: 'p',
        default: constants_1.default.PORT,
        description: 'port',
    }),
};
HealthCheck.examples = [
    '$ percy healthcheck',
    '$ percy healthcheck --port 6884',
];
exports.default = HealthCheck;
