import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { SortOrder, StampField, StampSort } from 'model';
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { FormRow } from './Form';
import { Selector } from './Selector';

const SortOrderSelector: React.VFC<{ value: SortOrder; onChange: (_: SortOrder) => void }> = (props) => {
  const ArrowComponent = props.value === SortOrder.Asc ? ArrowUpwardIcon : ArrowDownwardIcon;
  return (
    <Button variant="none" size="sm" onClick={() => props.onChange(props.value.reverse())}>
      <ArrowComponent />
    </Button>
  );
};

export const SortSelector: React.VFC<{
  className?: string;
  label: string;
  value: StampSort;
  onChange: (sort: StampSort) => void;
}> = React.memo((props) => {
  const onChange = (change: Partial<StampSort>) => props.onChange(props.value.applyChange(change));
  return (
    <>
      <Form.Label>{props.label}</Form.Label>
      <FormRow className={props.className}>
        <Selector
          eq="deep"
          selected={props.value.field}
          renderer={(field) => field.displayName}
          options={StampField.AllValues}
          onSelect={(field) => onChange({ field })}
        />
        <SortOrderSelector value={props.value.order} onChange={(order) => onChange({ order })} />
      </FormRow>
    </>
  );
});
SortSelector.displayName = 'SortSelector';
