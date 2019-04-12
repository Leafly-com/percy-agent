import PercyClientService from './percy-client-service';
export default class ResourceService extends PercyClientService {
    resourcesUploaded: any[];
    buildId: number;
    constructor(buildId: number);
    createResourceFromFile(responseUrl: string, copyFilePath: string, contentType?: string): any;
    uploadMissingResources(response: any, resources: any[]): Promise<boolean>;
}
