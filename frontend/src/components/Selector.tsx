import React from 'react';
import { Form } from 'react-bootstrap';
import _ from 'underscore';

interface Props<T> {
  options: T[];
  renderer?: (_: T) => React.ReactNode;
  selected: T;
  onSelect: (_: T) => void;
  className?: string;
  eq?: 'deep' | 'shallow';
  size?: 'sm' | 'lg';
}

const typedMemo: <T>(c: T) => T = React.memo;
export const Selector = typedMemo(<T,>(props: Props<T>) => {
  const eq = props.eq ?? 'shallow';
  const renderer = props.renderer ?? ((v: T) => v);
  const selectedIndex = _.findIndex(props.options, (v) =>
    eq === 'deep' ? _.isEqual(props.selected, v) : props.selected === v,
  );
  return (
    <Form.Select
      className={props.className}
      size={props.size}
      as="select"
      value={selectedIndex}
      onChange={(e) => props.onSelect(props.options[e.target.value as unknown as number])}
    >
      {props.options.map((option, index) => {
        return (
          <option key={index} value={index} onClick={() => props.onSelect(option)}>
            {renderer(option)}
          </option>
        );
      })}
    </Form.Select>
  );
});
(Selector as unknown as { displayName: string }).displayName = 'Selector';
