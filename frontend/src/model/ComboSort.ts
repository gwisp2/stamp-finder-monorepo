import { SortOrder } from './SortOrder.ts';
import { ComboField } from './ComboField.ts';
import { Stamp } from '../api/SfDatabase.ts';
import { StampCombo } from './StampCombo.tsx';
import _ from 'lodash';

export class ComboSort {
  constructor(
    readonly field: ComboField,
    readonly order: SortOrder,
  ) {}

  computeStampWeight(stamp: Stamp): number {
    return this.reverseMultiplier() * this.field.extractStampValue(stamp);
  }

  computeComboWeights(combo: StampCombo): number {
    return _.sumBy(combo.stamps, (s) => this.computeStampWeight(s));
  }

  toString(): string {
    return `${this.field}-${this.order}`;
  }

  private reverseMultiplier(): number {
    return this.order === SortOrder.Desc ? 1 : -1;
  }
}
