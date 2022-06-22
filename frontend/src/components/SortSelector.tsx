import { SortOrder, StampField, StampSort } from 'model';
import React from 'react';
import { Form } from 'react-bootstrap';
import { Selector } from './Selector';

const AllSorts = Array<StampSort>(
  new StampSort(StampField.Id, SortOrder.Natural),
  new StampSort(StampField.Id, SortOrder.Reversed),
  new StampSort(StampField.Value, SortOrder.Natural),
  new StampSort(StampField.Value, SortOrder.Reversed),
);

export const SortSelector: React.VFC<{
  className?: string;
  label: string;
  value: StampSort;
  onChange: (sort: StampSort) => void;
}> = React.memo((props) => {
  return (
    <div className={props.className}>
      <Form.Label>{props.label}</Form.Label>
      <Selector
        eq="deep"
        selected={props.value}
        renderer={(sort) => sort.name()}
        options={AllSorts}
        onSelect={(sort) => props.onChange(sort)}
      />
    </div>
  );
});
