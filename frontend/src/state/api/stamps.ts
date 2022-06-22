import _ from 'underscore';

export interface RawStamps {
  readonly [property: string]: RawStamp;
}

export interface RawStamp {
  readonly page: string;
  readonly image: string | null;
  readonly value: number | null;
  readonly year: number | null;
  readonly categories: Array<string> | null;
  readonly series?: string;
  readonly name?: string;
}

export interface Stamp {
  id: number;
  idNameAndSeries: string;
  page: string;
  imageUrl: string | null;
  value: number | null;
  year: number | null;
  categories: Array<string>;
  series: string | null;
  name: string | null;
}

export interface StampsState {
  [id: number]: Stamp;
}

export const decodeStamps = (baseUrl: string, response: RawStamps): StampsState => {
  const res: StampsState = {};
  for (const [k, v] of Object.entries(response)) {
    const id = Number(k);
    res[id] = {
      id,
      ..._.pick(v, ['page', 'value', 'year']),
      categories: v.categories ?? [],
      imageUrl: baseUrl + v.image,
      series: v.series ?? null,
      name: v.name ?? null,
      idNameAndSeries: (id + '|' + (v.name || '') + '|' + (v.series || '')).toLowerCase(),
    };
  }
  return res;
};
