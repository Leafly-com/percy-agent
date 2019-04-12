"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Constants {
}
Constants.PORT = 5338;
// Agent Service paths
Constants.SNAPSHOT_PATH = '/percy/snapshot';
Constants.STOP_PATH = '/percy/stop';
Constants.HEALTHCHECK_PATH = '/percy/healthcheck';
exports.default = Constants;
