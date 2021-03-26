import {NumberRange} from "./number-range";

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
    constructor(
        readonly value: NumberRange,
        readonly year: NumberRange,
        readonly presenceRequired: boolean,
        readonly sort: StampSort
    ) {

    }
}

export class Stamp {
    constructor(
        readonly id: number,
        readonly imageUrl: URL | null,
        readonly value: number | null,
        readonly year: number | null,
        readonly present: boolean
    ) {
    }
}

export class StampDb {
    constructor(readonly stamps: Array<Stamp>) {
    }

    findStamps(searchOptions: SearchOptions): Array<Stamp> {
        const filteredStamps = this.stamps.filter((s) => {
            return searchOptions.year.contains(s.year) && searchOptions.value.contains(s.value) &&
                (!searchOptions.presenceRequired || s.present);
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