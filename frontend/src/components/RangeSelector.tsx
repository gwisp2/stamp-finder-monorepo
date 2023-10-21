import { Box, InputAdornment, InputLabel } from '@mui/material';
import { parseNumberFromInput } from 'model';
import React, { useEffect } from 'react';
import { FieldPathByValue, FieldValues, useWatch } from 'react-hook-form';
import { FormHandle } from './FormHandle';
import { RangeShortcut, RangeShortcutsDropdown } from './RangeShortcutsDropdown';
import { RHFOutlinedInput, RHFSwitch } from './react-hook-form-mui';
import { setFormValue, typedMemo } from './utilities';

export interface RangeSelectorProps<TFormData extends FieldValues> {
  formHandle: FormHandle<TFormData>;
  isExactPath: FieldPathByValue<TFormData, boolean>;
  startPath: FieldPathByValue<TFormData, string>;
  endPath: FieldPathByValue<TFormData, string>;

  lowerBound?: number;
  upperBound?: number;
  unit?: string;

  shortcuts?: RangeShortcut[];
  shortcutsComment?: string;
  label?: React.ReactNode;
}

interface RangePointInputProps<TFormData extends FieldValues> {
  id?: string;
  startAdornmentText?: string;
  endAdornmentText?: string;
  formHandle: FormHandle<TFormData>;
  edgePath: FieldPathByValue<TFormData, string>;
  lowerBound?: number | null;
  upperBound?: number | null;
}

const RangePointInput = typedMemo(function RangePointInput<TFormData extends FieldValues>(
  props: RangePointInputProps<TFormData>,
) {
  return (
    <RHFOutlinedInput
      id={props.id}
      handle={props.formHandle}
      path={props.edgePath}
      inputMode="numeric"
      pattern="[0-9]*"
      startAdornment={
        props.startAdornmentText ? <InputAdornment position="start">{props.startAdornmentText}</InputAdornment> : null
      }
      endAdornment={
        props.endAdornmentText ? <InputAdornment position="end">{props.endAdornmentText}</InputAdornment> : null
      }
    />
  );
});

export const RangeSelector = typedMemo(function RangeSelector<TFormData extends FieldValues>(
  props: RangeSelectorProps<TFormData>,
) {
  // Extract some props
  const formHandle = props.formHandle;
  // Handle changes: trigger other fields so that validation errors are shown all fields
  const isExact: boolean = useWatch({ control: formHandle.control, name: props.isExactPath });
  const startValue = parseNumberFromInput(useWatch({ control: formHandle.control, name: props.startPath }));
  const endValue = parseNumberFromInput(useWatch({ control: formHandle.control, name: props.endPath }));
  useEffect(() => {
    formHandle.trigger(props.startPath);
    formHandle.trigger(props.endPath);
  }, [formHandle, props.startPath, props.endPath, startValue, endValue, isExact]);

  const startInputId = 'field-' + props.startPath;
  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <div>
          <InputLabel htmlFor={startInputId}>{props.label}</InputLabel>
        </div>
        <Box display="flex">
          <RHFSwitch handle={formHandle} path={props.isExactPath} />
          {props.shortcuts && (
            <RangeShortcutsDropdown
              unit={props.unit}
              shortcuts={props.shortcuts}
              shortcutsComment={props.shortcutsComment}
              onSelect={(range) => {
                const values = range.toFormValuesWithSwitch();
                setFormValue(formHandle, props.startPath, values.min);
                setFormValue(formHandle, props.endPath, values.max);
                if (!values.isExact) {
                  setFormValue(formHandle, props.isExactPath, false);
                }
              }}
            />
          )}
        </Box>
      </Box>
      {!isExact ? (
        <Box sx={{ display: 'flex', gap: '1em' }}>
          <RangePointInput
            id={startInputId}
            formHandle={formHandle}
            edgePath={props.startPath}
            startAdornmentText="от"
            endAdornmentText={props.unit}
          />
          <RangePointInput
            formHandle={formHandle}
            edgePath={props.endPath}
            startAdornmentText="до"
            endAdornmentText={props.unit}
          />
        </Box>
      ) : (
        <RangePointInput
          id={startInputId}
          formHandle={formHandle}
          edgePath={props.startPath}
          lowerBound={props.lowerBound}
          upperBound={props.upperBound}
          startAdornmentText="ровно"
          endAdornmentText={props.unit}
        />
      )}
    </>
  );
});
