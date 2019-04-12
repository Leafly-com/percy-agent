import { SnapshotOptions } from '../percy-agent-client/snapshot-options';
import AssetDiscoveryService from './asset-discovery-service';
import PercyClientService from './percy-client-service';
import ResourceService from './resource-service';
interface SnapshotServiceOptions {
    networkIdleTimeout?: number;
}
export default class SnapshotService extends PercyClientService {
    assetDiscoveryService: AssetDiscoveryService;
    resourceService: ResourceService;
    buildId: number;
    constructor(buildId: number, options?: SnapshotServiceOptions);
    buildResources(rootResourceUrl: string, domSnapshot: string | undefined, options: SnapshotOptions): Promise<any[]>;
    create(name: string, resources: any[], options?: SnapshotOptions, clientInfo?: string | null, environmentInfo?: string | null): Promise<any>;
    finalize(snapshotId: number): Promise<boolean>;
}
export {};
