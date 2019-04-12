import { Command } from '@oclif/command';
import * as winston from 'winston';
import AgentService from '../services/agent-service';
import ProcessService from '../services/process-service';
export default class PercyCommand extends Command {
    static hidden: boolean;
    agentService: AgentService;
    processService: ProcessService;
    logger: winston.LoggerInstance;
    percyToken: string;
    constructor(argv: string[], config: any);
    run(): Promise<void>;
    percyEnabled(): boolean;
    percyWillRun(): boolean;
    percyTokenPresent(): boolean;
    logStart(): void;
}
