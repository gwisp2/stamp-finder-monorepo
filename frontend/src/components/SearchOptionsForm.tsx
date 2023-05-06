import { zodResolver } from '@hookform/resolvers/zod';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import PublicIcon from '@mui/icons-material/Public';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, FormControlLabel, InputLabel } from '@mui/material';
import { SfDatabase } from 'api/SfDatabase';
import {
  ANY,
  NumberRange,
  SearchOptions,
  ShopRequirement,
  SortOrder,
  StampField,
  StampSort,
  zNullableInputString,
  zNumberRange,
  zNumberRangeWithSwitch,
} from 'model';
import React, { useMemo, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import z from 'zod';
import { FormHandle } from './FormHandle';
import { RangeSelector } from './RangeSelector';
import { RangeShortcut } from './RangeShortcutsDropdown';
import { SortSelector } from './SortSelector';
import { YearRangeSelector } from './YearRangeSelector';
import { RHFOutlinedInput, RHFSelect, RHFSwitch } from './react-hook-form-mui';

interface Props {
  db: SfDatabase;
  handle: FormHandle<z.input<typeof zSearchOptions>>;
  onChange?: (options: SearchOptions) => void;
}

const RangeShortcuts: RangeShortcut[] = [
  {
    icons: [RestartAltIcon],
    name: 'сбросить',
    range: NumberRange.exact(null),
  },
  {
    icons: [PhotoSizeSelectActualIcon],
    name: 'открытка по России',
    range: NumberRange.exact(19),
  },
  {
    icons: [PublicIcon, PhotoSizeSelectActualIcon],
    name: 'открытка в другие страны',
    range: NumberRange.exact(65),
  },
];

export const zSearchOptions = z
  .strictObject({
    valueRange: zNumberRangeWithSwitch,
    yearRange: zNumberRange,
    nameQuery: z.string(),
    category: zNullableInputString,
    shops: z.array(
      z.strictObject({
        shopId: z.string(),
        displayLabel: z.string(),
        selected: z.boolean(),
      }),
    ),
    sort: z.strictObject({
      fieldId: z.string().transform((v) => StampField.fromString(v)),
      direction: z.union([z.literal('asc'), z.literal('desc')]).transform((v) => SortOrder.fromString(v)),
    }),
  })
  .transform((val) => {
    const selectedShops = val.shops.filter((s) => s.selected);
    let shopRequirement: ShopRequirement = selectedShops.map((s) => s.shopId);
    if (shopRequirement.length === val.shops.length) {
      shopRequirement = ANY;
    }
    return new SearchOptions(
      val.valueRange,
      val.yearRange,
      val.category,
      shopRequirement,
      val.nameQuery,
      new StampSort(val.sort.fieldId, val.sort.direction),
    );
  });

export function createFormDataFromSearchOptions(
  db: SfDatabase,
  options: SearchOptions,
): z.input<typeof zSearchOptions> {
  return {
    valueRange: options.value.toFormValuesWithSwitch(),
    yearRange: options.year.toFormValues(),
    nameQuery: options.contains,
    category: options.category ?? '',
    shops: db.shops.map((shop) => ({
      shopId: shop.id,
      displayLabel: `${shop.displayName} [${shop.reportDate}]`,
      selected: options.availabilityRequired === ANY || (options.availabilityRequired?.includes(shop.id) ?? false),
    })),
    sort: {
      fieldId: options.sort.field.id,
      direction: options.sort.order.id,
    },
  };
}

export function useSearchOptionsForm(
  db: SfDatabase,
  defaultOptions: SearchOptions,
): FormHandle<z.input<typeof zSearchOptions>> {
  const defaultFormData = useMemo(() => createFormDataFromSearchOptions(db, defaultOptions), []);
  return useForm({
    defaultValues: defaultFormData,
    mode: 'all',
    resolver: zodResolver(zSearchOptions),
    criteriaMode: 'all',
  });
}

function FormSection(props: { children?: React.ReactNode }) {
  return <Box mb={2}>{props.children}</Box>;
}

export const SearchOptionsForm: React.FC<Props> = React.memo(function SearchOptionsForm(props) {
  // Initialize react-hook-form
  const db = props.db;
  const formHandle = props.handle;
  const shopFieldArray = useFieldArray({ name: 'shops', control: formHandle.control });
  // Prepare some data for rendering
  const categoriesWithEmpty = useMemo(() => ['', ...db.stats.categories], [db]);
  const categoryOptions = useMemo(
    () =>
      categoriesWithEmpty.map((cat) => ({
        value: cat,
        label: cat || '-',
      })),
    [categoriesWithEmpty],
  );
  // Call onChange only on valid and different form values
  const lastSearchOptions = useRef<SearchOptions>();
  React.useEffect(() => {
    const subscription = formHandle.watch((value) => {
      const parsedOptions = zSearchOptions.safeParse(value);
      if (parsedOptions.success) {
        lastSearchOptions.current = parsedOptions.data;
        props.onChange?.(parsedOptions.data);
      }
    });
    return () => subscription.unsubscribe();
  }, [formHandle.watch, props.onChange]);

  return (
    <form noValidate={true}>
      <FormSection>
        <RangeSelector
          formHandle={formHandle}
          shortcuts={RangeShortcuts}
          label="Номинал:"
          startPath="valueRange.min"
          endPath="valueRange.max"
          isExactPath="valueRange.isExact"
          lowerBound={0}
          unit="₽"
        />
      </FormSection>
      <FormSection>
        <InputLabel>Год выпуска:</InputLabel>
        <YearRangeSelector
          formHandle={formHandle}
          startPath="yearRange.min"
          endPath="yearRange.max"
          lowerBound={db.stats.minYear}
          upperBound={db.stats.maxYear}
        />
      </FormSection>
      <FormSection>
        <InputLabel>Название содержит:</InputLabel>
        <RHFOutlinedInput handle={formHandle} path="nameQuery" />
      </FormSection>
      <FormSection>
        <InputLabel>Рубрика:</InputLabel>
        <RHFSelect handle={formHandle} path="category" values={categoryOptions} />
      </FormSection>
      <FormSection>
        <InputLabel>Наличие:</InputLabel>
        {shopFieldArray.fields.map((field, index) => (
          <FormControlLabel
            key={field.id}
            control={<RHFSwitch handle={formHandle} path={`shops.${index}.selected`} />}
            label={field.displayLabel}
          />
        ))}
      </FormSection>
      <FormSection>
        <InputLabel>Сортировка:</InputLabel>
        <SortSelector formHandle={formHandle} directionPath="sort.direction" fieldIdPath="sort.fieldId" />
      </FormSection>
    </form>
  );
});
