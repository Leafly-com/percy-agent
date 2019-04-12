"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const url_1 = require("url");
const logger_1 = require("../utils/logger");
const percy_client_service_1 = require("./percy-client-service");
const resource_service_1 = require("./resource-service");
class ResponseService extends percy_client_service_1.default {
    constructor(buildId) {
        super();
        this.ALLOWED_RESPONSE_STATUSES = [200, 201, 304];
        this.responsesProcessed = new Map();
        this.resourceService = new resource_service_1.default(buildId);
    }
    async processResponse(rootResourceUrl, response, width) {
        logger_1.default.debug(`processing response: ${response.url()} for width: ${width}`);
        const url = this.parseRequestPath(response.url());
        // skip responses already processed
        const processResponse = this.responsesProcessed.get(url);
        if (processResponse) {
            return processResponse;
        }
        const request = response.request();
        const parsedRootResourceUrl = new url_1.URL(rootResourceUrl);
        const rootUrl = `${parsedRootResourceUrl.protocol}//${parsedRootResourceUrl.host}`;
        if (request.url() === rootResourceUrl) {
            // Always skip the root resource
            logger_1.default.debug(`Skipping [is_root_resource]: ${request.url()}`);
            return;
        }
        if (!this.ALLOWED_RESPONSE_STATUSES.includes(response.status())) {
            // Only allow 2XX responses:
            logger_1.default.debug(`Skipping [disallowed_response_status_${response.status()}] [${width} px]: ${response.url()}`);
            return;
        }
        if (!request.url().startsWith(rootUrl)) {
            // Disallow remote resource requests.
            logger_1.default.debug(`Skipping [is_remote_resource] [${width} px]: ${request.url()}`);
            return;
        }
        if (!response.url().startsWith(rootUrl)) {
            // Disallow remote redirects.
            logger_1.default.debug(`Skipping [is_remote_redirect] [${width} px]: ${response.url()}`);
            return;
        }
        const localCopy = await this.makeLocalCopy(response);
        const contentType = response.headers()['content-type'];
        const resource = this.resourceService.createResourceFromFile(url, localCopy, contentType);
        this.responsesProcessed.set(url, resource);
        return resource;
    }
    async makeLocalCopy(response) {
        logger_1.default.debug(`making local copy of response: ${response.url()}`);
        const buffer = await response.buffer();
        const sha = crypto.createHash('sha256').update(buffer).digest('hex');
        const filename = path.join(this.tmpDir(), sha);
        if (!fs.existsSync(filename)) {
            fs.writeFileSync(filename, buffer);
        }
        else {
            logger_1.default.debug(`Skipping file copy (already copied): ${response.url()}`);
        }
        return filename;
    }
    tmpDir() {
        return os.tmpdir();
    }
}
exports.default = ResponseService;
