import { FormRow } from 'components/Form';
import { YearSelector } from 'components/YearSelector';
import { NumberRange } from 'model';
import React from 'react';
import { Form } from 'react-bootstrap';

export interface YearRangeSelectorProps {
  className?: string;
  label?: string;
  startYear: number;
  endYear: number;
  value: NumberRange;
  onChange?: (range: NumberRange) => void;
}

export const YearRangeSelector: React.VFC<YearRangeSelectorProps> = React.memo((props) => {
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
          onSelect={(v) => onChange({ start: v })}
        />
        <Form.Label className="me-1 ms-1">До: </Form.Label>
        <YearSelector
          startYear={props.value.start ?? props.startYear}
          endYear={props.endYear}
          value={props.value.end}
          onSelect={(v) => onChange({ end: v })}
        />
      </FormRow>
    </div>
  );
});
YearRangeSelector.displayName = 'YearRangeSelector';
