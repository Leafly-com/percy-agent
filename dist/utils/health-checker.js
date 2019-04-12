"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const retryAxios = require("retry-axios");
const logger_1 = require("./logger");
async function healthCheck(port, retryOptions) {
    const healthcheckUrl = `http://localhost:${port}/percy/healthcheck`;
    const retryConfig = Object.assign({ retry: 5, retryDelay: 500, shouldRetry: () => true }, retryOptions);
    const interceptorId = retryAxios.attach();
    await axios_1.default({
        method: 'get',
        url: healthcheckUrl,
        raxConfig: retryConfig,
    }).then(() => {
        logger_1.default.info('percy is ready.');
    }).catch((error) => {
        logger_1.default.error(`Failed to establish a connection with ${healthcheckUrl}`);
        logger_1.default.debug(error);
    });
    retryAxios.detach(interceptorId);
}
exports.default = healthCheck;
