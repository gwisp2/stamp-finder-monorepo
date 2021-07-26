import {NumberRange} from "./number-range";
import _ from "underscore";

export enum StampField {
    Id, Value
}

export enum SortOrder {
    Natural, Reversed
}

export class StampSort {
    constructor(readonly field: StampField, readonly order: SortOrder) {
    }
}

export class SearchOptions {
    static Default = new SearchOptions(
        new NumberRange(null, null),
        new NumberRange(1998, null),
        null,
        false, "", new StampSort(StampField.Id, SortOrder.Reversed)
    );

    constructor(
        readonly value: NumberRange,
        readonly year: NumberRange,
        readonly category: string|null,
        readonly presenceRequired: boolean,
        readonly contains: string,
        readonly sort: StampSort
    ) {

    }

    static fromUrlParams(params: URLSearchParams): SearchOptions {
        const valueStr = params.get("value");
        const yearStr = params.get("year");
        const categoryStr = params.get("category");
        const containsStr = params.get("contains");
        const presentStr = params.get("present");
        const sortStr = params.get("sort");
        const value = valueStr !== null ? SearchOptions.fromUrlParam(valueStr) : SearchOptions.Default.value;
        const year = yearStr !== null ? SearchOptions.fromUrlParam(yearStr) : SearchOptions.Default.year;
        const category = categoryStr !== null ? (categoryStr !== "<null>" ? categoryStr : null) : SearchOptions.Default.category;
        const present = presentStr !== null ? Boolean(presentStr) : SearchOptions.Default.presenceRequired;
        let sort = SearchOptions.Default.sort;
        if (sortStr !== null) {
            const sortParts = sortStr.split("-");
            const field = Number(sortParts[0]);
            const order = Number(sortParts[1]);
            sort = new StampSort(field, order);
        }
        return new SearchOptions(value, year, category, present, containsStr || "", sort);
    }

    private static fromUrlParam(p: string): NumberRange {
        const parts = p.split("~")
        const start = parts[0] !== "" ? Number(parts[0]) : null;
        const end = parts[1] !== "" ? Number(parts[1]) : null;
        return new NumberRange(start, end)
    }

    toUrlParams(): URLSearchParams {
        const params = new URLSearchParams();
        if (!_.isEqual(SearchOptions.Default.value, this.value)) {
            params.set("value", SearchOptions.toUrlParam(this.value))
        }
        if (!_.isEqual(SearchOptions.Default.year, this.year)) {
            params.set("year", SearchOptions.toUrlParam(this.year))
        }
        if (this.category !== SearchOptions.Default.category) {
            params.set("category", this.category ?? "<null>");
        }
        if (this.presenceRequired !== SearchOptions.Default.presenceRequired) {
            params.set("present", "" + this.presenceRequired)
        }
        if (!_.isEqual(this.sort, SearchOptions.Default.sort)) {
            params.set("sort", this.sort.field + "-" + this.sort.order)
        }
        if (!_.isEqual(this.contains, SearchOptions.Default.contains)) {
            params.set("contains", this.contains)
        }
        return params
    }

    private static toUrlParam(range: NumberRange): string {
        const startStr = range.start !== null ? "" + range.start : ""
        const endStr = range.end !== null ? "" + range.end : ""
        return startStr + "~" + endStr
    }
}

export class Stamp {
    readonly idNameAndSeries: string;

    constructor(
        readonly id: number,
        readonly page: URL,
        readonly imageUrl: URL | null,
        readonly value: number | null,
        readonly year: number | null,
        readonly categories: Array<string>,
        readonly series: string | null,
        readonly name: string | null,
        readonly present: boolean
    ) {
        this.idNameAndSeries = (id + "|" + (name || "") + "|" + (series || "")).toLowerCase();
    }
}

export class StampDb {
    constructor(readonly stamps: Array<Stamp>) {
    }

    findStamps(searchOptions: SearchOptions): Array<Stamp> {
        const containsLowered = searchOptions.contains.toLowerCase();
        const filteredStamps = this.stamps.filter((s) => {
            return searchOptions.year.contains(s.year) && searchOptions.value.contains(s.value) &&
                (!searchOptions.presenceRequired || s.present) &&
                (searchOptions.category === null || s.categories.includes(searchOptions.category)) &&
                (s.idNameAndSeries.indexOf(containsLowered) >= 0);
        });
        return filteredStamps.sort((a, b) => {
            let v = 0;
            switch (searchOptions.sort.field) {
                case StampField.Id:
                    v = a.id - b.id;
                    break;
                case StampField.Value:
                    if (b.value !== null && a.value !== null) {
                        v = a.value - b.value;
                    } else if (b.value === null && a.value !== null) {
                        v = -1;
                    } else if (b.value !== null && a.value === null) {
                        v = 1;
                    } else {
                        v = 0;
                    }
                    break;
            }
            if (searchOptions.sort.order === SortOrder.Reversed) {
                v = -v;
            }
            return v;
        });
    }
}