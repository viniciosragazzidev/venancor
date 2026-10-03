export interface StorageAdapter {
  put(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  getSignedUrl(path: string): Promise<string>;
  delete(path: string): Promise<void>;
}
