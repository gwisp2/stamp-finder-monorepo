import { ANY, NumberRange, SearchOptions, StampSort } from "model";

test('Default options are encoded by empty string', () => {
    expect(SearchOptions.Default.toUrlSearchString()).toBe("");
});

test('Parsing empty string results in default options', () => {
    expect(SearchOptions.fromUrlSearchString("")).toStrictEqual(SearchOptions.Default);
});

describe('Parsing encoded options results in the same options', () => {
    const check = (options: SearchOptions) => {
        const encodedOptions = options.toUrlSearchString()
        test(`"${encodedOptions}"`, () =>
            expect(SearchOptions.fromUrlSearchString(encodedOptions)).toStrictEqual(options)
        )
    }

    check(SearchOptions.Default)
    check(SearchOptions.Default.applyChange({ value: NumberRange.exact(15) }))
    check(SearchOptions.Default.applyChange({ value: NumberRange.between(15, 19) }))
    check(SearchOptions.Default.applyChange({ contains: "x" }))
    check(SearchOptions.Default.applyChange({ category: "cat" }))
    check(SearchOptions.Default.applyChange({ presenceRequired: ANY }))
    check(SearchOptions.Default.applyChange({ presenceRequired: null }))
    check(SearchOptions.Default.applyChange({ presenceRequired: ["shop1"] }))
    check(SearchOptions.Default.applyChange({ year: NumberRange.exact(2000) }))
    check(SearchOptions.Default.applyChange({ year: NumberRange.between(2010, 2013) }))
    check(SearchOptions.Default.applyChange({ sort: StampSort.fromString("id-asc") }))
    check(SearchOptions.Default.applyChange({ sort: StampSort.fromString("id-desc") }))
    check(SearchOptions.Default.applyChange({ sort: StampSort.fromString("value-desc") }))
    check(SearchOptions.Default.applyChange({ sort: StampSort.fromString("value-desc"), year: NumberRange.between(2010, 2013), category: "cat" }))
});