import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import PublicIcon from '@mui/icons-material/Public';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, FormControlLabel, InputLabel } from '@mui/material';
import { SfDatabase } from 'api/SfDatabase';
import { NumberRange, SearchOptions, zSearchOptions } from 'model';
import React, { useMemo, useRef } from 'react';
import { useFieldArray } from 'react-hook-form';
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

const ValueRangeShortcuts: RangeShortcut[] = [
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
    name: 'открытка в Беларусь или Казахстан',
    range: NumberRange.exact(65),
  },
  {
    icons: [PublicIcon, PhotoSizeSelectActualIcon],
    name: 'открытка в другие страны',
    range: NumberRange.exact(75),
  },
];

function FormSection(props: { children?: React.ReactNode }) {
  return <Box mb={2}>{props.children}</Box>;
}

export const SearchOptionsForm: React.FC<Props> = React.memo(function SearchOptionsForm({ db, handle, onChange }) {
  // Initialize react-hook-form
  const shopFieldArray = useFieldArray({ name: 'shops', control: handle.control });
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
    const subscription = handle.watch((value) => {
      const parsedOptions = zSearchOptions.safeParse(value);
      if (parsedOptions.success) {
        lastSearchOptions.current = parsedOptions.data;
        onChange?.(parsedOptions.data);
      }
    });
    return () => subscription.unsubscribe();
  }, [handle, onChange]);

  return (
    <form noValidate={true}>
      <FormSection>
        <RangeSelector
          formHandle={handle}
          shortcuts={ValueRangeShortcuts}
          label="Номинал:"
          startPath="valueRange.min"
          endPath="valueRange.max"
          isExactPath="valueRange.isExact"
          lowerBound={0}
          unit="₽"
        />
      </FormSection>
      <FormSection>
        <InputLabel id="year-selector-label">Год выпуска:</InputLabel>
        <YearRangeSelector
          labelId="year-selector-label"
          formHandle={handle}
          startPath="yearRange.min"
          endPath="yearRange.max"
          lowerBound={db.stats.minYear}
          upperBound={db.stats.maxYear}
        />
      </FormSection>
      <FormSection>
        <InputLabel htmlFor="field-stamp-name-includes">Название содержит:</InputLabel>
        <RHFOutlinedInput id="field-stamp-name-includes" handle={handle} path="nameQuery" />
      </FormSection>
      <FormSection>
        <InputLabel id="field-category-label">Рубрика:</InputLabel>
        <RHFSelect labelId="field-category-label" handle={handle} path="category" values={categoryOptions} />
      </FormSection>
      <FormSection>
        <InputLabel>Наличие:</InputLabel>
        {shopFieldArray.fields.map((field, index) => (
          <FormControlLabel
            key={field.id}
            control={<RHFSwitch handle={handle} path={`shops.${index}.selected`} />}
            label={field.displayLabel}
          />
        ))}
      </FormSection>
      <FormSection>
        <InputLabel id="field-sort-label">Сортировка:</InputLabel>
        <SortSelector
          labelId="field-sort-label"
          formHandle={handle}
          directionPath="sort.direction"
          fieldIdPath="sort.fieldId"
        />
      </FormSection>
    </form>
  );
});
