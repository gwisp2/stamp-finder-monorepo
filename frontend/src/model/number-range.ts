export class NumberRange {
    exact: boolean

    constructor(readonly start: number | null, readonly end: number | null, exact?: boolean) {
        if (exact === true && start !== end) {
            throw new Error("exact === true && start !== end");
        }
        this.exact = exact !== undefined ? exact : (start === end);
    }

    static exact(value: number|null) {
        return new NumberRange(value, value, true);
    }

    static between(start: number|null, end: number|null) {
        return new NumberRange(start, end, false);
    }

    contains(n: number|null) {
        if (n === null) {
            return this.start === null && this.end === null;
        }
        return (this.start === null || this.start <= n) && (this.end === null || this.end >= n);
    }
}
