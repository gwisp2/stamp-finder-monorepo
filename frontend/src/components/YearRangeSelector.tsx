import { Box } from '@mui/material';
import _ from 'lodash';
import { useEffect } from 'react';
import { FieldPathByValue, FieldValues, useWatch } from 'react-hook-form';
import { maxOf, minOf, parseNumberFromInput } from '../model';
import { FormHandle } from './FormHandle';
import { RHFSelect } from './react-hook-form-mui';
import { typedMemo } from './utilities';

export interface YearRangeSelectorProps<TFormData extends FieldValues> {
  labelId?: string;
  formHandle: FormHandle<TFormData>;
  startPath: FieldPathByValue<TFormData, string>;
  endPath: FieldPathByValue<TFormData, string>;
  lowerBound?: number;
  upperBound?: number;
}

interface YearSelectorProps<TFormData extends FieldValues> {
  labelId?: string;
  formHandle: FormHandle<TFormData>;
  path: FieldPathByValue<TFormData, string>;
  prefix?: string;
  lowerBound?: number | null;
  upperBound?: number | null;
}

const YearSelector = <TFormData extends FieldValues>(props: YearSelectorProps<TFormData>) => {
  let selectOptions: { value: string; label: string }[];
  const currentValue = useWatch({ control: props.formHandle.control, name: props.path });
  if (props.lowerBound != undefined && props.upperBound != undefined) {
    const availableValues = _.range(props.lowerBound, props.upperBound + 1);
    if (currentValue && !availableValues.includes(Number(currentValue))) {
      availableValues.push(Number(currentValue));
    }
    selectOptions = [
      { value: '', label: '-' },
      ...availableValues.reverse().map((n) => ({
        value: n.toString(),
        label: `${props.prefix ?? ''}${n.toString()}`,
      })),
    ];
  } else {
    selectOptions = [{ value: '', label: '-' }];
  }
  return <RHFSelect labelId={props.labelId} handle={props.formHandle} path={props.path} values={selectOptions} />;
};

export const YearRangeSelector = typedMemo(function YearRangeSelector<TFormData extends FieldValues>(
  props: YearRangeSelectorProps<TFormData>,
) {
  // Extract some props
  const formHandle = props.formHandle;
  // Compute bounds
  const startValue = parseNumberFromInput(useWatch({ control: formHandle.control, name: props.startPath }));
  const endValue = parseNumberFromInput(useWatch({ control: formHandle.control, name: props.endPath }));
  const upperBoundOfStart = minOf([endValue, props.upperBound]);
  const lowerBoundOfEnd = maxOf([startValue, props.lowerBound]);
  // Trigger other fields so that validation errors are shown all fields
  useEffect(() => {
    formHandle.trigger(props.startPath);
    formHandle.trigger(props.endPath);
  }, [formHandle, props.startPath, props.endPath, startValue, endValue]);

  return (
    <Box sx={{ display: 'flex', gap: '1em' }}>
      <YearSelector
        labelId={props.labelId}
        formHandle={formHandle}
        path={props.startPath}
        lowerBound={props.lowerBound}
        upperBound={upperBoundOfStart}
        prefix="с "
      />
      <YearSelector
        formHandle={formHandle}
        path={props.endPath}
        lowerBound={lowerBoundOfEnd}
        upperBound={props.upperBound}
        prefix="по "
      />
    </Box>
  );
});
