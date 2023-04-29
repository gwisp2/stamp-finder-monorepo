import { array, Infer, object, optional, string } from 'superstruct';
import * as URI from 'uri-js';
import { ApiError, fetchJsonFromUrl } from './fetch-helper';

export const ConfigStruct = object({
  sources: object({
    stamps: array(string()),
    shops: array(string()),
  }),
  api: object({
    upload: string(),
  }),
  analytics: optional(
    object({
      google: optional(string()),
    }),
  ),
});
export type Config = Infer<typeof ConfigStruct>;

export class ConfigLoader {
  private configPath = 'config.json';

  async loadConfig(): Promise<Config> {
    try {
      const configJson = await fetchJsonFromUrl(this.configPath);
      const config = ConfigStruct.create(configJson);
      config.sources.stamps = this.resolveUris(config.sources.stamps);
      config.sources.shops = this.resolveUris(config.sources.shops);
      config.api.upload = this.resolveUri(config.api.upload);
      return config;
    } catch (err) {
      throw ApiError.wrap(err);
    }
  }

  private resolveUri(relativeUrl: string): string {
    return URI.resolve(this.configPath, relativeUrl);
  }

  private resolveUris(relativeUrls: string[]): string[] {
    return relativeUrls.map((relativeUrl) => this.resolveUri(relativeUrl));
  }
}
