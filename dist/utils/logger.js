"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors = require("colors");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: (process.env.LOG_LEVEL || 'info'),
            showLevel: false,
            label: colors.magenta('percy'),
        }),
    ],
});
function profile(id, meta, callback) {
    if (process.env.LOG_LEVEL === 'debug') {
        // Only pass the callback through if it is defined, because the winston.Logger implementation
        // does not behave as expected if you pass a null callback (it will ignore the meta parameter).
        if (callback) {
            return logger.profile(id, id, meta, callback);
        }
        else {
            return logger.profile(id, id, meta);
        }
    }
}
exports.profile = profile;
function logError(error) {
    logger.error(`${error.name} ${error.message}`);
    logger.debug(error);
}
exports.logError = logError;
exports.default = logger;
