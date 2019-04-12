"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const configuration = (relativePath = '.percy.yml') => {
    const configFilePath = path.join(process.cwd(), relativePath);
    try {
        return yaml.safeLoad(fs.readFileSync(configFilePath, 'utf8'));
    }
    catch (_a) {
        // this is ok because we just use this configuration as one of the fallbacks
        // in a chain. snapshot specific options -> agent configuration -> default values
        const defaultConfiguration = {
            version: 1.0, snapshot: {},
        };
        return defaultConfiguration;
    }
};
exports.default = configuration;
