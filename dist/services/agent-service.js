"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const configuration_1 = require("../utils/configuration");
const logger_1 = require("../utils/logger");
const build_service_1 = require("./build-service");
const constants_1 = require("./constants");
const process_service_1 = require("./process-service");
const snapshot_service_1 = require("./snapshot-service");
class AgentService {
    constructor() {
        this.snapshotService = null;
        this.publicDirectory = `${__dirname}/../../dist/public`;
        this.snapshotCreationPromises = [];
        this.server = null;
        this.buildId = null;
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(express.static(this.publicDirectory));
        this.app.post(constants_1.default.SNAPSHOT_PATH, this.handleSnapshot.bind(this));
        this.app.post(constants_1.default.STOP_PATH, this.handleStop.bind(this));
        this.app.get(constants_1.default.HEALTHCHECK_PATH, this.handleHealthCheck.bind(this));
        this.buildService = new build_service_1.default();
    }
    async start(options = {}) {
        this.buildId = await this.buildService.create();
        if (this.buildId !== null) {
            this.server = this.app.listen(options.port);
            this.snapshotService = new snapshot_service_1.default(this.buildId, { networkIdleTimeout: options.networkIdleTimeout });
            await this.snapshotService.assetDiscoveryService.setup();
            return;
        }
        await this.stop();
    }
    async stop() {
        logger_1.default.info('stopping percy...');
        logger_1.default.info(`waiting for ${this.snapshotCreationPromises.length} snapshots to complete...`);
        await Promise.all(this.snapshotCreationPromises);
        logger_1.default.info('done.');
        if (this.snapshotService) {
            await this.snapshotService.assetDiscoveryService.teardown();
        }
        await this.buildService.finalize();
        if (this.server) {
            await this.server.close();
        }
    }
    async handleSnapshot(request, response) {
        logger_1.profile('agentService.handleSnapshot');
        logger_1.default.debug('handling snapshot:');
        logger_1.default.debug(`-> headers: ${JSON.stringify(request.headers)}`);
        logger_1.default.debug(`-> body: ${JSON.stringify(request.body)}`);
        if (!this.snapshotService) {
            return response.json({ success: false });
        }
        const snapshotConfiguration = (configuration_1.default().snapshot || {});
        const snapshotOptions = {
            widths: request.body.widths || snapshotConfiguration.widths,
            enableJavaScript: request.body.enableJavaScript,
            minHeight: request.body.minHeight || snapshotConfiguration['min-height'],
        };
        const resources = await this.snapshotService.buildResources(request.body.url, request.body.domSnapshot, snapshotOptions);
        const snapshotCreation = this.snapshotService.create(request.body.name, resources, snapshotOptions, request.body.clientInfo, request.body.environmentInfo);
        this.snapshotCreationPromises.push(snapshotCreation);
        logger_1.default.info(`snapshot taken: '${request.body.name}'`);
        logger_1.profile('agentService.handleSnapshot');
        return response.json({ success: true });
    }
    async handleStop(_, response) {
        await this.stop();
        new process_service_1.default().kill();
        return response.json({ success: true });
    }
    async handleHealthCheck(_, response) {
        return response.json({ success: true });
    }
}
exports.default = AgentService;
