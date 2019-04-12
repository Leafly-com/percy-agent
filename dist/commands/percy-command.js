"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const agent_service_1 = require("../services/agent-service");
const process_service_1 = require("../services/process-service");
const logger_1 = require("../utils/logger");
class PercyCommand extends command_1.Command {
    constructor(argv, config) {
        super(argv, config);
        this.agentService = new agent_service_1.default();
        this.processService = new process_service_1.default();
        this.logger = logger_1.default;
        this.percyToken = process.env.PERCY_TOKEN || '';
    }
    async run() {
        if (this.percyEnabled && !this.percyTokenPresent()) {
            this.warn('Skipping visual tests. PERCY_TOKEN was not provided.');
        }
    }
    percyEnabled() {
        return process.env.PERCY_ENABLE !== '0';
    }
    percyWillRun() {
        return (this.percyEnabled() && this.percyTokenPresent());
    }
    percyTokenPresent() {
        return this.percyToken.trim() !== '';
    }
    logStart() {
        this.logger.info('percy has started.');
    }
}
PercyCommand.hidden = true;
exports.default = PercyCommand;
