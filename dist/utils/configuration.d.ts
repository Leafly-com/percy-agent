export interface SnapshotConfiguration {
    widths?: [number];
    'min-height'?: number;
}
export interface Configuration {
    version: number;
    snapshot: SnapshotConfiguration;
}
declare const configuration: (relativePath?: string) => Configuration;
export default configuration;
