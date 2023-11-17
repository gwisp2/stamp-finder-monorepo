import { Stamp } from '../api/SfDatabase.ts';

export class ComboField {
  static Space = new ComboField('space', 'По занимаемому месту', (s) => s.shape?.bboxArea ?? 0);
  static Width = new ComboField('width', 'По ширине', (s) => s.shape?.width ?? 0);
  static AllValues = [ComboField.Space, ComboField.Width];

  private constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly extractStampValue: (s: Stamp) => number,
  ) {}

  toString() {
    return this.id;
  }

  static fromString(id: string): ComboField {
    const field = ComboField.AllValues.find((f) => f.id === id);
    if (!field) {
      throw new Error(`Invalid id: ${id}`);
    }
    return field;
  }
}
