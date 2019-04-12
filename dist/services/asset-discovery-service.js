"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const logger_1 = require("../utils/logger");
const wait_for_network_idle_1 = require("../utils/wait-for-network-idle");
const percy_client_service_1 = require("./percy-client-service");
const response_service_1 = require("./response-service");
const axios_1 = require("axios");
class AssetDiscoveryService extends percy_client_service_1.default {
    constructor(buildId, options = {}) {
        super();
        this.DEFAULT_NETWORK_IDLE_TIMEOUT = 50; // ms
        // How many 'pages' (i.e. tabs) we'll keep around.
        // We will only be able to process at most these many snapshot widths.
        this.PAGE_POOL_SIZE = 10;
        // Default widths to use for asset discovery. Must match Percy service defaults.
        this.DEFAULT_WIDTHS = [1280, 375];
        this.responseService = new response_service_1.default(buildId);
        this.networkIdleTimeout = options.networkIdleTimeout || this.DEFAULT_NETWORK_IDLE_TIMEOUT;
        this.browser = null;
        this.pages = null;
    }
    async setup() {
        logger_1.profile('-> assetDiscoveryService.puppeteer.launch');
        const { data: { data: { webSocketDebuggerUrl } } } = await axios_1.default.get('http://chromium:9222/json/version');
        this.browser = await puppeteer.connect({
            browserWSEndpoint: webSocketDebuggerUrl
        });
        logger_1.profile('-> assetDiscoveryService.puppeteer.launch');
        logger_1.profile('-> assetDiscoveryService.browser.newPagePool');
        const pagePromises = [];
        for (let i = 0; i < this.PAGE_POOL_SIZE; i++) {
            const promise = this.browser.newPage().then((page) => {
                return page.setRequestInterception(true).then(() => page);
            });
            pagePromises.push(promise);
        }
        this.pages = await Promise.all(pagePromises);
        logger_1.profile('-> assetDiscoveryService.browser.newPagePool');
    }
    async discoverResources(rootResourceUrl, domSnapshot, options) {
        logger_1.profile('-> assetDiscoveryService.discoverResources');
        if (!this.browser || !this.pages || !this.pages.length) {
            logger_1.default.error('Puppeteer failed to open with a page pool.');
            return [];
        }
        if (options.widths && options.widths.length > this.pages.length) {
            logger_1.default.error(`Too many widths requested. Max allowed is ${this.PAGE_POOL_SIZE}. Requested: ${options.widths}`);
            return [];
        }
        rootResourceUrl = this.parseRequestPath(rootResourceUrl);
        logger_1.default.debug(`discovering assets for URL: ${rootResourceUrl}`);
        const enableJavaScript = options.enableJavaScript || false;
        const widths = options.widths || this.DEFAULT_WIDTHS;
        // Do asset discovery for each requested width in parallel. We don't keep track of which page
        // is doing work, and instead rely on the fact that we always have fewer widths to work on than
        // the number of pages in our pool. If we wanted to do something smarter here, we should consider
        // switching to use puppeteer-cluster instead.
        logger_1.profile('--> assetDiscoveryService.discoverForWidths', { url: rootResourceUrl });
        const resourcePromises = [];
        for (let idx = 0; idx < widths.length; idx++) {
            const promise = this.resourcesForWidth(this.pages[idx], widths[idx], domSnapshot, rootResourceUrl, enableJavaScript);
            resourcePromises.push(promise);
        }
        const resourceArrays = await Promise.all(resourcePromises);
        let resources = [].concat(...resourceArrays);
        logger_1.profile('--> assetDiscoveryService.discoverForWidths');
        const resourceUrls = [];
        // Dedup by resourceUrl as they must be unique when sent to Percy API down the line.
        resources = resources.filter((resource) => {
            if (!resourceUrls.includes(resource.resourceUrl)) {
                resourceUrls.push(resource.resourceUrl);
                return true;
            }
            return false;
        });
        logger_1.profile('-> assetDiscoveryService.discoverResources', { resourcesDiscovered: resources.length });
        return resources;
    }
    shouldRequestResolve(request) {
        const requestPurpose = request.headers().purpose;
        switch (requestPurpose) {
            case 'prefetch':
            case 'preload':
            case 'dns-prefetch':
            case 'prerender':
            case 'preconnect':
            case 'subresource':
                return false;
            default:
                return true;
        }
    }
    async teardown() {
        await this.closePages();
        await this.closeBrowser();
    }
    async resourcesForWidth(page, width, domSnapshot, rootResourceUrl, enableJavaScript) {
        logger_1.default.debug(`discovering assets for width: ${width}`);
        await page.setJavaScriptEnabled(enableJavaScript);
        await page.setViewport(Object.assign(page.viewport(), { width }));
        page.on('request', async (request) => {
            if (!this.shouldRequestResolve(request)) {
                await request.abort();
                return;
            }
            if (request.url() === rootResourceUrl) {
                await request.respond({
                    body: domSnapshot,
                    contentType: 'text/html',
                    status: 200,
                });
                return;
            }
            await request.continue();
        });
        const maybeResourcePromises = [];
        // Listen on 'requestfinished', which tells us a request completed successfully.
        // We could also listen on 'response', but then we'd have to check if it was successful.
        page.on('requestfinished', async (request) => {
            const response = request.response();
            if (response) {
                // Parallelize the work in processResponse as much as possible, but make sure to
                // wait for it to complete before returning from the asset discovery phase.
                const promise = this.responseService.processResponse(rootResourceUrl, response, width);
                promise.catch(logger_1.logError);
                maybeResourcePromises.push(promise);
            }
            else {
                logger_1.default.debug(`No response for ${request.url()}. Skipping.`);
            }
        });
        // Debug log failed requests.
        page.on('requestfailed', async (request) => {
            logger_1.default.debug(`Failed to load ${request.url()} : ${request.failure().errorText}}`);
        });
        logger_1.profile('--> assetDiscoveryService.page.goto', { url: rootResourceUrl });
        await page.goto(rootResourceUrl);
        logger_1.profile('--> assetDiscoveryService.page.goto');
        logger_1.profile('--> assetDiscoveryService.waitForNetworkIdle');
        await wait_for_network_idle_1.default(page, this.networkIdleTimeout).catch(logger_1.logError);
        logger_1.profile('--> assetDiscoveryService.waitForNetworkIdle');
        page.removeAllListeners();
        logger_1.profile('--> assetDiscoveryServer.waitForResourceProcessing');
        const maybeResources = await Promise.all(maybeResourcePromises);
        logger_1.profile('--> assetDiscoveryServer.waitForResourceProcessing');
        return maybeResources.filter((maybeResource) => maybeResource != null);
    }
    async closeBrowser() {
        if (!this.browser) {
            return;
        }
        await this.browser.close();
        this.browser = null;
    }
    async closePages() {
        if (!this.pages) {
            return;
        }
        await Promise.all(this.pages.map((page) => page.close()));
        this.pages = null;
    }
}
exports.default = AssetDiscoveryService;
