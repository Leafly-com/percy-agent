import { AgentOptions } from './agent-options';
import BuildService from './build-service';
import SnapshotService from './snapshot-service';
export default class AgentService {
    buildService: BuildService;
    snapshotService: SnapshotService | null;
    private readonly app;
    private readonly publicDirectory;
    private snapshotCreationPromises;
    private server;
    private buildId;
    constructor();
    start(options?: AgentOptions): Promise<void>;
    stop(): Promise<void>;
    private handleSnapshot;
    private handleStop;
    private handleHealthCheck;
}
