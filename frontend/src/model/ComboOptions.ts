import { SfDatabase, Stamp } from 'api/SfDatabase';
import { NumberRange, zNumberRange, zNumberRangeWithSwitch } from './NumberRange';
import z from 'zod';
import { useMemo } from 'react';
import { useFieldArray, UseFieldArrayReturn, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StampAvailabilityRequirement } from './StampAvailabilityRequirement.ts';
import { zInputNumber, zNullableInputString } from './utility.ts';
import { SortOrder } from './SortOrder.ts';
import { ComboField } from './ComboField.ts';
import { ComboSort } from './ComboSort.ts';

export class ComboOptions {
  static readonly Default = new ComboOptions(
    new NumberRange(null, null),
    new NumberRange(1998, null),
    null,
    2,
    StampAvailabilityRequirement.NO_REQUIREMENT,
    new ComboSort(ComboField.Width, SortOrder.Asc),
  );

  private valueOfStamps: NumberRange;

  constructor(
    readonly value: NumberRange,
    readonly year: NumberRange,
    readonly category: string | null,
    readonly nOfStamps: number,
    readonly availabilityRequirement: StampAvailabilityRequirement,
    readonly sort: ComboSort,
  ) {
    this.valueOfStamps = NumberRange.between(null, value.end);
  }

  filterAcceptedStamps(stamps: Stamp[]): Stamp[] {
    return stamps.filter((s) => this.isAcceptedStamp(s));
  }

  isAcceptedStamp(s: Stamp): boolean {
    return (
      this.year.contains(s.year) &&
      this.valueOfStamps.contains(s.value) &&
      this.availabilityRequirement.matches(s) &&
      (this.category === null || s.categories.includes(this.category))
    );
  }

  toFormData(db: SfDatabase): ComboOptionsFormData {
    return {
      valueRange: this.value.toFormValuesWithSwitch(),
      yearRange: this.year.toFormValues(),
      category: this.category ?? '',
      shops: this.availabilityRequirement.toFormData(db.shops),
      nOfStamps: this.nOfStamps.toString(),
      sort: {
        fieldId: this.sort.field.id,
        direction: this.sort.order.id,
      },
    };
  }
}

// zSearchOptions is a zod schema that transforms form data to SearchOptions object
export const zComboOptions = z
  .strictObject({
    nOfStamps: zInputNumber,
    valueRange: zNumberRangeWithSwitch,
    yearRange: zNumberRange,
    category: zNullableInputString,
    shops: z.array(
      z.strictObject({
        shopId: z.string(),
        displayLabel: z.string(),
        selected: z.boolean(),
      }),
    ),
    sort: z.strictObject({
      fieldId: z.string().transform((v) => ComboField.fromString(v)),
      direction: z.union([z.literal('asc'), z.literal('desc')]).transform((v) => SortOrder.fromString(v)),
    }),
  })
  .transform((val) => {
    return new ComboOptions(
      val.valueRange,
      val.yearRange,
      val.category,
      val.nOfStamps,
      StampAvailabilityRequirement.fromFormData(val.shops),
      new ComboSort(val.sort.fieldId, val.sort.direction),
    );
  });
export type ComboOptionsFormData = z.input<typeof zComboOptions>;
export type ComboFormHandle = {
  context: UseFormReturn<ComboOptionsFormData>;
  shopFieldArray: UseFieldArrayReturn<ComboOptionsFormData, 'shops'>;
};

export function useComboOptionsForm(db: SfDatabase, defaultOptions: ComboOptions): ComboFormHandle {
  const defaultFormData = useMemo(() => defaultOptions.toFormData(db), [defaultOptions, db]);
  const context = useForm({
    defaultValues: defaultFormData,
    mode: 'all',
    resolver: zodResolver(zComboOptions),
    criteriaMode: 'all',
  });
  const shopFieldArray = useFieldArray({ name: 'shops', control: context.control });
  return { context, shopFieldArray };
}
