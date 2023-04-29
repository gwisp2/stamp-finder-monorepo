import { MenuItem, OutlinedInput, Select, Switch } from '@mui/material';
import React, { HTMLAttributes, useMemo } from 'react';
import { Controller, FieldPathByValue, FieldValues } from 'react-hook-form';
import { FormHandle } from './FormHandle';

export function RHFOutlinedInput<TFormData extends FieldValues>(props: {
  handle: FormHandle<TFormData>;
  path: FieldPathByValue<TFormData, string>;
  inputMode?: HTMLAttributes<unknown>['inputMode'];
  pattern?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}): React.ReactElement {
  return (
    <Controller
      name={props.path}
      control={props.handle.control}
      render={({ field, fieldState }) => {
        return (
          <OutlinedInput
            {...field}
            inputRef={field.ref}
            fullWidth
            size="small"
            type="text"
            inputProps={{ inputMode: props.inputMode, pattern: props.pattern }}
            error={fieldState.invalid}
            startAdornment={props.startAdornment}
            endAdornment={props.endAdornment}
          />
        );
      }}
    />
  );
}

export function RHFSwitch<TFormData extends FieldValues>(props: {
  handle: FormHandle<TFormData>;
  path: FieldPathByValue<TFormData, boolean>;
}): React.ReactElement {
  return (
    <Controller
      name={props.path}
      control={props.handle.control}
      render={({ field }) => {
        return <Switch {...field} inputRef={field.ref} checked={!!field.value} size="small" />;
      }}
    />
  );
}

export function RHFSelect<TFormData extends FieldValues>(props: {
  handle: FormHandle<TFormData>;
  path: FieldPathByValue<TFormData, string>;
  values: { value: string; label: string }[];
}): React.ReactElement {
  const menuItems = useMemo(
    () =>
      props.values.map(({ value, label }) => (
        <MenuItem key={value || '-'} value={value}>
          {label}
        </MenuItem>
      )),
    [props.values],
  );
  return (
    <Controller
      control={props.handle.control}
      render={({ field, fieldState }) => (
        <Select {...field} inputRef={field.ref} error={fieldState.invalid} size="small" fullWidth>
          {menuItems}
        </Select>
      )}
      name={props.path}
    />
  );
}
