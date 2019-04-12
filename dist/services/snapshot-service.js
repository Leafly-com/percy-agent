"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const asset_discovery_service_1 = require("./asset-discovery-service");
const percy_client_service_1 = require("./percy-client-service");
const resource_service_1 = require("./resource-service");
class SnapshotService extends percy_client_service_1.default {
    constructor(buildId, options = {}) {
        super();
        this.buildId = buildId;
        this.assetDiscoveryService = new asset_discovery_service_1.default(buildId, { networkIdleTimeout: options.networkIdleTimeout });
        this.resourceService = new resource_service_1.default(buildId);
    }
    async buildResources(rootResourceUrl, domSnapshot = '', options) {
        const rootResource = await this.percyClient.makeResource({
            resourceUrl: rootResourceUrl,
            content: domSnapshot,
            isRoot: true,
            mimetype: 'text/html',
        });
        let resources = [];
        const discoveredResources = await this.assetDiscoveryService.discoverResources(rootResourceUrl, domSnapshot, options);
        resources = resources.concat([rootResource]);
        resources = resources.concat(discoveredResources);
        return resources;
    }
    create(name, resources, options = {}, clientInfo = null, environmentInfo = null) {
        const snapshotCreationPromise = this.percyClient.createSnapshot(this.buildId, resources, Object.assign({ name }, options, { minimumHeight: options.minHeight, clientInfo, environmentInfo })).then(async (response) => {
            await this.resourceService.uploadMissingResources(response, resources);
            return response;
        }).then(async (response) => {
            const snapshotId = response.body.data.id;
            logger_1.profile('-> snapshotService.finalizeSnapshot');
            await this.finalize(response.body.data.id);
            logger_1.profile('-> snapshotService.finalizeSnapshot', { snapshotId });
            return response;
        }).catch(logger_1.logError);
        return snapshotCreationPromise;
    }
    async finalize(snapshotId) {
        try {
            await this.percyClient.finalizeSnapshot(snapshotId);
            return true;
        }
        catch (error) {
            logger_1.logError(error);
            return false;
        }
    }
}
exports.default = SnapshotService;
