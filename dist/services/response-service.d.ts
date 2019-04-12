import * as puppeteer from 'puppeteer';
import PercyClientService from './percy-client-service';
import ResourceService from './resource-service';
export default class ResponseService extends PercyClientService {
    resourceService: ResourceService;
    readonly ALLOWED_RESPONSE_STATUSES: number[];
    responsesProcessed: Map<string, string>;
    constructor(buildId: number);
    processResponse(rootResourceUrl: string, response: puppeteer.Response, width: number): Promise<any | null>;
    makeLocalCopy(response: puppeteer.Response): Promise<string>;
    tmpDir(): string;
}
