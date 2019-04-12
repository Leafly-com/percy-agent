import * as puppeteer from 'puppeteer';
import { SnapshotOptions } from '../percy-agent-client/snapshot-options';
import PercyClientService from './percy-client-service';
import ResponseService from './response-service';
interface AssetDiscoveryOptions {
    networkIdleTimeout?: number;
}
export default class AssetDiscoveryService extends PercyClientService {
    responseService: ResponseService;
    browser: puppeteer.Browser | null;
    pages: puppeteer.Page[] | null;
    readonly DEFAULT_NETWORK_IDLE_TIMEOUT: number;
    networkIdleTimeout: number;
    readonly PAGE_POOL_SIZE: number;
    readonly DEFAULT_WIDTHS: number[];
    constructor(buildId: number, options?: AssetDiscoveryOptions);
    setup(): Promise<void>;
    discoverResources(rootResourceUrl: string, domSnapshot: string, options: SnapshotOptions): Promise<any[]>;
    shouldRequestResolve(request: puppeteer.Request): boolean;
    teardown(): Promise<void>;
    private resourcesForWidth;
    private closeBrowser;
    private closePages;
}
export {};
