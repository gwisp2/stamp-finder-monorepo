import {Stamp, StampDb} from "./stamps";

interface StampsJson {
    readonly [property: string]: StampsJsonEntry
}

interface StampsJsonEntry {
    readonly page: string
    readonly image: string | null
    readonly value: number | null
    readonly year: number | null
    readonly categories: Array<string> | null
    readonly series?: string
    readonly name?: string
    readonly present: boolean
}

export async function fetchStampsDb(url: URL): Promise<StampDb> {
    const response = await fetch(url.toString());
    const stampsJson = await response.json() as StampsJson;
    const stampArray = Array<Stamp>();
    Object.keys(stampsJson).forEach((k) => {
        const entry = stampsJson[k]
        const image = entry.image ? new URL(entry.image, url) : null
        const categories = entry.categories ?? Array<string>()
        const series = entry.series ?? null
        const name = entry.name ?? null
        stampArray.push(new Stamp(Number(k), new URL(entry.page), image, entry.value, entry.year, categories, series, name, entry.present))
    });
    return new StampDb(stampArray)
}