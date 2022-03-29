import React, { useEffect, useState } from 'react';
import { NumberRange } from '../../model/number-range';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import './RangeSelector.css';

export interface RangeSelectorProps {
  className?: string;
  label?: React.ReactNode;
  value: NumberRange;
  onChange?: (range: NumberRange) => void;
}

function parseNumber(s: undefined): undefined;
function parseNumber(s: string): number | null;
function parseNumber(s: string | undefined): number | null | undefined;
function parseNumber(s: string | undefined): number | null | undefined {
  if (s === undefined) {
    return undefined;
  }
  if (s.length !== 0) {
    const n = Number(s);
    return !isNaN(n) ? n : null;
  } else {
    return null;
  }
}

const toString = (n: number | null): string => {
  return n?.toString() ?? '';
};

const coalesce = <T,>(x: T | undefined, defaultValue: T): T => {
  return x !== undefined ? x : defaultValue;
};

export const RangeSelector: React.VFC<RangeSelectorProps> = (props) => {
  const [startStr, setStartStr] = useState(toString(props.value.start));
  const [endStr, setEndStr] = useState(toString(props.value.end));

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
      <div className="range-selector-row mb-2">
        {props.label}
        <DropdownButton variant="custom-white" title={props.value.exact ? 'Ровно' : 'Между'} size="sm" className="ms-2">
          <Dropdown.Item onSelect={() => update({ exact: true })}>Ровно</Dropdown.Item>
          <Dropdown.Item onSelect={() => update({ exact: false })}>Между</Dropdown.Item>
        </DropdownButton>
      </div>
      {!props.value.exact ? (
        <div className="range-selector-row">
          <Form.Label className="me-1">От: </Form.Label>
          <Form.Control
            name="startStr"
            type="number"
            value={startStr}
            onChange={(e) => update({ start: e.target.value })}
          />
          <Form.Label className="me-1 ms-1">До: </Form.Label>
          <Form.Control name="endStr" type="number" value={endStr} onChange={(e) => update({ end: e.target.value })} />
        </div>
      ) : (
        <div className="range-selector-row">
          <Form.Control
            name="exactStr"
            type="number"
            value={startStr}
            onChange={(e) => update({ start: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};
