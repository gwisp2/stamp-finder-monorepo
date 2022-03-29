import { parseNumber } from 'model';
import React from 'react';
import { Form } from 'react-bootstrap';
import _ from 'underscore';

export interface YearSelectorProps {
  startYear: number;
  endYear: number;
  value: number | null;
  onChange?: (year: number | null) => void;
}

export const YearSelector: React.VFC<YearSelectorProps> = (props) => {
  const onSelect = (e: React.FormEvent<HTMLSelectElement>) => {
    if (props.onChange !== undefined) {
      props.onChange(parseNumber((e.target as unknown as { value: string }).value));
    }
  };

  return (
    <Form.Select as="select" value={props.value?.toString() ?? 'null'} onChange={onSelect}>
      <option key="null" value="null" />
      {_.range(props.startYear, props.endYear + 1).map((i) => {
        return (
          <option key={i} value={i}>
            {i}
          </option>
        );
      })}
    </Form.Select>
  );
};
