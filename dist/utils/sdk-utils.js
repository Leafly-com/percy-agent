"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const path = require("path");
const constants_1 = require("../services/constants");
const logger_1 = require("./logger");
function agentJsFilename() {
    try {
        return require.resolve('@percy/agent/dist/public/percy-agent.js');
    }
    catch (_a) {
        return path.resolve(__dirname, '../../dist/public/percy-agent.js');
    }
}
exports.agentJsFilename = agentJsFilename;
async function isAgentRunning() {
    return axios_1.default({
        method: 'get',
        url: `http://localhost:${constants_1.default.PORT}${constants_1.default.HEALTHCHECK_PATH}`,
    }).then(() => {
        return true;
    }).catch((error) => {
        return false;
    });
}
exports.isAgentRunning = isAgentRunning;
async function postSnapshot(body) {
    const URL = `http://localhost:${constants_1.default.PORT}${constants_1.default.SNAPSHOT_PATH}`;
    const ONE_HUNDRED_MB_IN_BYTES = 100000000;
    return axios_1.default({
        method: 'post',
        maxContentLength: ONE_HUNDRED_MB_IN_BYTES,
        url: URL,
        data: body,
    }).then(() => {
        return true;
    }).catch((error) => {
        logger_1.logError(error);
        return false;
    });
}
exports.postSnapshot = postSnapshot;
