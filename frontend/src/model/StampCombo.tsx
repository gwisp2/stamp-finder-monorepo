import { Stamp } from '../api/SfDatabase.ts';
import _ from 'lodash';

export class StampCombo {
  readonly totalValue: number;
  readonly spaceUsed: number;
  readonly widthUsed: number;

  constructor(readonly stamps: Stamp[]) {
    this.spaceUsed = _.sumBy(stamps, (s) => s.shape?.bboxArea ?? 0);
    this.widthUsed = _.sumBy(stamps, (s) => s.shape?.width ?? 0);
    this.totalValue = Math.round(_.sumBy(stamps, (s) => s.value ?? 0) * 100) / 100;
  }
}
