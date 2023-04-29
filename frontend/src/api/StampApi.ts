import React from 'react';
import { Config } from './ConfigLoader';
import { ApiError, fetchJsonFromSources } from './fetch-helper';
import { RawShops } from './RawShops';
import { RawStamps } from './RawStamps';
import { SfDatabase } from './SfDatabase';

export class StampApi {
  constructor(private config: Config) {}

  async uploadShopDataFile(file: File): Promise<void> {
    try {
      const data = new FormData();
      data.append('file', file);
      const result = await fetch(this.config.api.upload, {
        method: 'POST',
        body: data,
      });
      if (!result.ok) {
        const errMessage = await result
          .json()
          .then((result) => result.message)
          .catch(() => `Error fetching ${result.url}\nResponse status: ${result.status} ${result.statusText}`);
        throw new ApiError(errMessage);
      }
    } catch (err) {
      throw ApiError.wrap(err);
    }
  }

  async loadDatabase(): Promise<SfDatabase> {
    try {
      const stamps = await this.loadStamps();
      const shops = await this.loadShops();
      return new SfDatabase(stamps, shops);
    } catch (err) {
      throw ApiError.wrap(err);
    }
  }

  private async loadStamps(): Promise<RawStamps> {
    const result = await fetchJsonFromSources(this.config.sources.stamps);
    return {
      baseUrl: result.url.replace(/[^/]*$/, ''),
      stamps: result.content,
    };
  }

  private async loadShops(): Promise<RawShops> {
    return (await fetchJsonFromSources(this.config.sources.shops)).content;
  }
}

export const StampApiContext = React.createContext<StampApi | null>(null);
export const StampApiProvider = StampApiContext.Provider;
export const useStampApi = (): StampApi => {
  const api = React.useContext(StampApiContext);
  if (!api) {
    throw new Error('useStampApi must be used within a StampApiProvider');
  }
  return api;
};
