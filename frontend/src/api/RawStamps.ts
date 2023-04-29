export interface RawStamps {
  baseUrl: string;
  stamps: RawStamp[];
}

export interface RawStamp {
  readonly id: string;
  readonly page: string;
  readonly image: string | null;
  readonly value: number | null;
  readonly year: number | null;
  readonly categories: Array<string> | null;
  readonly series?: string;
  readonly name?: string;
}
