export interface ICloudProvider {
  uploadFile(file: any, path: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFile(key: string): Promise<Buffer>;
}
