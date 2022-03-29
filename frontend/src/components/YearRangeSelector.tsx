import React from 'react';
import { NumberRange } from 'model';
import { Form } from 'react-bootstrap';
import { YearSelector } from 'components/YearSelector';
import { FormRow } from 'components/Form';

export interface YearRangeSelectorProps {
  className?: string;
  label?: string;
  startYear: number;
  endYear: number;
  value: NumberRange;
  onChange?: (range: NumberRange) => void;
}

export const YearRangeSelector: React.VFC<YearRangeSelectorProps> = (props) => {
  const onChange = (change: { start?: number | null; end?: number | null }) => {
    const range = {
      start: props.value.start,
      end: props.value.end,
      ...change,
    };
    if (props.onChange) {
      props.onChange(new NumberRange(range.start, range.end));
    }
  };

  return (
    <div className={props.className}>
      <Form.Label>{props.label}</Form.Label>
      <FormRow>
        <Form.Label className="me-1">От: </Form.Label>
        <YearSelector
          startYear={props.startYear}
          endYear={props.value.end ?? props.endYear}
          value={props.value.start}
          onChange={(v) => onChange({ start: v })}
        />
        <Form.Label className="me-1 ms-1">До: </Form.Label>
        <YearSelector
          startYear={props.value.start ?? props.startYear}
          endYear={props.endYear}
          value={props.value.end}
          onChange={(v) => onChange({ end: v })}
        />
      </FormRow>
    </div>
  );
};
