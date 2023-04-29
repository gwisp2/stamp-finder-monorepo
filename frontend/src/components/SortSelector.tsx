import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box, IconButton } from '@mui/material';
import { StampField } from 'model';
import { FieldPathByValue, FieldValues, useController } from 'react-hook-form';
import { FormHandle } from './FormHandle';
import { RHFSelect } from './react-hook-form-mui';

export interface SortSelectorProps<TFormData extends FieldValues> {
  formHandle: FormHandle<TFormData>;
  fieldIdPath: FieldPathByValue<TFormData, string>;
  directionPath: FieldPathByValue<TFormData, 'asc' | 'desc'>;
}

export function SortSelector<TFormData extends FieldValues>(props: SortSelectorProps<TFormData>) {
  const dirController = useController({
    control: props.formHandle.control,
    name: props.directionPath,
  });
  const flippedDirection = dirController.field.value === 'asc' ? 'desc' : 'asc';
  const ArrowComponent = dirController.field.value === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon;
  const allFieldValues = StampField.AllValues.map((field) => ({
    value: field.id,
    label: field.displayName,
  }));
  return (
    <Box display="flex">
      <RHFSelect handle={props.formHandle} path={props.fieldIdPath} values={allFieldValues} />
      <IconButton
        sx={{ ml: '0' }}
        size="medium"
        color="inherit"
        edge="start"
        onClick={() => dirController.field.onChange(flippedDirection)}
      >
        <ArrowComponent />
      </IconButton>
    </Box>
  );
}
