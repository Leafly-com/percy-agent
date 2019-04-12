"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../services/constants");
const percy_agent_client_1 = require("./percy-agent-client");
const serialize_cssom_1 = require("./serialize-cssom");
const serialize_input_1 = require("./serialize-input");
class PercyAgent {
    constructor(options = {}) {
        this.client = null;
        this.defaultDoctype = '<!DOCTYPE html>';
        this.clientInfo = options.clientInfo || null;
        this.environmentInfo = options.environmentInfo || null;
        // Default to 'true' unless explicitly disabled.
        this.handleAgentCommunication = options.handleAgentCommunication !== false;
        this.domTransformation = options.domTransformation || null;
        this.port = options.port || constants_1.default.PORT;
        if (this.handleAgentCommunication) {
            this.xhr = options.xhr || XMLHttpRequest;
            this.client = new percy_agent_client_1.PercyAgentClient(`http://localhost:${this.port}`, this.xhr);
        }
    }
    snapshot(name, options = {}) {
        const documentObject = options.document || document;
        const domSnapshot = this.domSnapshot(documentObject);
        if (this.handleAgentCommunication && this.client) {
            this.client.post(constants_1.default.SNAPSHOT_PATH, {
                name,
                url: documentObject.URL,
                // enableJavascript is deprecated. Use enableJavaScript
                enableJavaScript: options.enableJavaScript || options.enableJavascript,
                widths: options.widths,
                // minimumHeight is deprecated. Use minHeight
                minHeight: options.minHeight || options.minimumHeight,
                clientInfo: this.clientInfo,
                environmentInfo: this.environmentInfo,
                domSnapshot,
            });
        }
        return domSnapshot;
    }
    domSnapshot(documentObject) {
        const doctype = this.getDoctype(documentObject);
        const dom = this.stabilizeDOM(documentObject);
        let domClone = dom.cloneNode(true);
        // Sometimes you'll want to transform the DOM provided into one ready for snapshotting
        // For example, if your test suite runs tests in an element inside a page that
        // lists all yours tests. You'll want to "hoist" the contents of the testing container to be
        // the full page. Using a dom transformation is how you'd acheive that.
        if (this.domTransformation) {
            domClone = this.domTransformation(domClone);
        }
        const snapshotString = doctype + domClone.outerHTML;
        // Remove all the additions we've made to the original DOM.
        // Ideally we would make a deep clone of the original DOM at the start of this
        // method, and operate on that, but this turns out to be hard to do while
        // retaining CSS OM and input element state. Instead, we carefully remove what we added.
        serialize_cssom_1.cleanSerializedCssOm(documentObject);
        serialize_input_1.cleanSerializedInputElements(documentObject);
        return snapshotString;
    }
    getDoctype(documentObject) {
        return documentObject.doctype ? this.doctypeToString(documentObject.doctype) : this.defaultDoctype;
    }
    doctypeToString(doctype) {
        const publicDeclaration = doctype.publicId ? ` PUBLIC "${doctype.publicId}" ` : '';
        const systemDeclaration = doctype.systemId ? ` SYSTEM "${doctype.systemId}" ` : '';
        return `<!DOCTYPE ${doctype.name}` + publicDeclaration + systemDeclaration + '>';
    }
    stabilizeDOM(doc) {
        let stabilizedDOM = doc;
        stabilizedDOM = serialize_cssom_1.serializeCssOm(stabilizedDOM);
        stabilizedDOM = serialize_input_1.serializeInputElements(stabilizedDOM);
        // more calls to come here
        return stabilizedDOM.documentElement;
    }
}
exports.default = PercyAgent;
