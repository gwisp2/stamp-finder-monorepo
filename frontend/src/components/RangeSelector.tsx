import { FormRow } from 'components/Form';
import { NumberRange, parseNumber, toString } from 'model';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Selector } from './Selector';

export interface RangeSelectorProps {
  className?: string;
  label?: React.ReactNode;
  value: NumberRange;
  onChange?: (range: NumberRange) => void;
}

const coalesce = <T,>(x: T | undefined, defaultValue: T): T => {
  return x !== undefined ? x : defaultValue;
};

export const RangeSelector: React.VFC<RangeSelectorProps> = (props) => {
  const [startStr, setStartStr] = useState(toString(props.value.start));
  const [endStr, setEndStr] = useState(toString(props.value.end));

  // Update start & end string on external change
  useEffect(() => {
    const prevStart = parseNumber(startStr);
    const prevEnd = parseNumber(endStr);
    if (prevStart !== props.value.start) {
      setStartStr(toString(props.value.start));
    }
    if (prevEnd !== props.value.end) {
      setEndStr(toString(props.value.end));
    }
  }, [props.value]);

  const update = (change: { start?: string; end?: string; exact?: boolean }) => {
    // Update start/end strings
    const newStart = coalesce(change.start, toString(props.value.start));
    const newEnd = coalesce(change.end, toString(props.value.end));
    const newExact = change.exact ?? props.value.exact;
    setStartStr(newStart);
    setEndStr(newEnd);

    // Parse those strings to numbers
    const newStartNumber = parseNumber(newStart);
    const newEndNumber = parseNumber(newEnd);
    if (props.onChange !== undefined) {
      const newRange = newExact ? NumberRange.exact(newStartNumber) : NumberRange.between(newStartNumber, newEndNumber);
      props.onChange(newRange);
    }
  };

  return (
    <div className={props.className}>
      <FormRow className="mb-2">
        {props.label}
        <Selector
          size="sm"
          className="ms-2"
          options={[true, false]}
          selected={props.value.exact}
          renderer={(v) => (v ? 'Ровно' : 'Между')}
          onSelect={(v) => update({ exact: v })}
        />
      </FormRow>
      {!props.value.exact ? (
        <FormRow>
          <Form.Label className="me-1">От: </Form.Label>
          <Form.Control
            name="startStr"
            type="number"
            value={startStr}
            onChange={(e) => update({ start: e.target.value })}
          />
          <Form.Label className="me-1 ms-1">До: </Form.Label>
          <Form.Control name="endStr" type="number" value={endStr} onChange={(e) => update({ end: e.target.value })} />
        </FormRow>
      ) : (
        <FormRow>
          <Form.Control
            name="exactStr"
            type="number"
            value={startStr}
            onChange={(e) => update({ start: e.target.value })}
          />
        </FormRow>
      )}
    </div>
  );
};
