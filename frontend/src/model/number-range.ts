export class NumberRange {
    constructor(readonly start: number | null, readonly end: number | null) {
    }

    contains(n: number|null) {
        if (n === null) {
            return this.start === null && this.end === null;
        }
        return (this.start === null || this.start <= n) && (this.end === null || this.end >= n);
    }
}
