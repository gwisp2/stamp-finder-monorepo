import React from 'react';
import { FormProvider } from 'react-hook-form';
import {
  FormSection,
  ShopListSection,
  SortSection,
  StampCategoryChooserSection,
  StampValueSection,
  StampYearSection,
} from './FormBits.tsx';
import { ComboFormHandle } from '../model/ComboOptions.ts';
import { RHFOutlinedInput } from './react-hook-form-mui.tsx';
import { InputLabel } from '@mui/material';
import { ComboField } from '../model/ComboField.ts';

interface Props {
  handle: ComboFormHandle;
}

export const ComboOptionsForm: React.FC<Props> = React.memo(function ComboOptionsForm(props) {
  const handle = props.handle;
  return (
    <FormProvider {...handle.context}>
      <form noValidate={true}>
        <FormSection>
          <InputLabel id="n-of-stamps-selector-label">Количество марок:</InputLabel>
          <RHFOutlinedInput path="nOfStamps" />
        </FormSection>
        <StampValueSection path="valueRange" label={'Сумма номиналов'} />
        <StampYearSection path="yearRange" />
        <StampCategoryChooserSection path="category" />
        <ShopListSection fieldArray={handle.shopFieldArray} />
        <SortSection path="sort" fields={ComboField.AllValues} />
      </form>
    </FormProvider>
  );
});
