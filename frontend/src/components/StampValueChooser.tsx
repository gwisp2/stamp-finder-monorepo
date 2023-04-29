import { NumberRange } from 'model';
import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { RangeSelector } from './RangeSelector';

const ValueShortcutButtons: React.FC<{
  values: number[];
  onChange: (newRange: NumberRange) => void;
}> = React.memo((props) => {
  const valueButtons = props.values.map((value) => (
    <Button variant="outline-secondary" key={`V${value}`} onClick={() => props.onChange(new NumberRange(value, value))}>
      {value}
    </Button>
  ));
  valueButtons.push(
    <Button
      key="VAny"
      variant="outline-secondary"
      className="btn btn-outline-secondary"
      onClick={() => props.onChange(new NumberRange(null, null))}
    >
      Все
    </Button>,
  );
  return (
    <ButtonGroup size="sm" aria-label="Номиналы" className="ms-1">
      {valueButtons}
    </ButtonGroup>
  );
});
ValueShortcutButtons.displayName = 'ValueShortcutButtons';

export const StampValueChooser: React.FC<{
  label: string;
  value: NumberRange;
  onChange: (newRange: NumberRange) => void;
  shortcutValues: number[];
  className?: string;
}> = React.memo((props) => {
  return (
    <RangeSelector
      className={props.className}
      label={
        <div>
          <span className="me-1">{props.label}</span>
          <ValueShortcutButtons values={props.shortcutValues} onChange={props.onChange} />
        </div>
      }
      value={props.value}
      onChange={props.onChange}
    />
  );
});
StampValueChooser.displayName = 'StampValueChooser';
