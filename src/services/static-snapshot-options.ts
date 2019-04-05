export interface StaticSnapshotOptions {
    staticAssetDirectory: string,
    port: number,
    widths: number[],
    baseUrl: string,
    snapshotCaptureRegex: string,
    snapshotIgnoreRegex?: string | undefined,
  }