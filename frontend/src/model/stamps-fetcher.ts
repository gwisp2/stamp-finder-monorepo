import {Stamp, StampDb} from "./stamps";

interface StampsJson {
    readonly [property: string]: StampsJsonEntry
}

interface StampsJsonEntry {
    readonly page: string
    readonly image: string | null
    readonly value: number | null
    readonly year: number | null
    readonly present: boolean
}

export async function fetchStampsDb(url: URL): Promise<StampDb> {
    const response = await fetch(url.toString());
    const stampsJson = await response.json() as StampsJson;
    const stampArray = Array<Stamp>();
    Object.keys(stampsJson).forEach((k) => {
        const entry = stampsJson[k]
        const image = entry.image ? new URL(entry.image, url) : null
        stampArray.push(new Stamp(Number(k), new URL(entry.page), image, entry.value, entry.year, entry.present))
    });
    return new StampDb(stampArray)
}