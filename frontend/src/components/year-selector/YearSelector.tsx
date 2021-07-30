import React from 'react';
import { Form } from 'react-bootstrap';
import _ from 'underscore';

export interface YearSelectorProps {
  startYear: number;
  endYear: number;
  value: number | null;
  onChange?: (year: number | null) => void;
}

export class YearSelector extends React.Component<YearSelectorProps> {
  constructor(props: YearSelectorProps) {
    super(props);
    this.handleYearSelection = this.handleYearSelection.bind(this);
  }

  render(): React.ReactNode {
    return (
      <Form.Select
        as="select"
        value={this.props.value?.toString() ?? 'null'}
        onChange={(e) => this.handleYearSelection((e.target as unknown as { value: string }).value)}
      >
        <option key="null" value="null" />
        {_.range(this.props.startYear, this.props.endYear + 1).map((i) => {
          return (
            <option key={i} value={i}>
              {i}
            </option>
          );
        })}
      </Form.Select>
    );
  }

  private handleYearSelection(v: string) {
    if (this.props.onChange !== undefined) {
      this.props.onChange(YearSelector.parseNumber(v));
    }
  }

  private static parseNumber(s: string): number | null {
    if (s.length !== 0) {
      const n = Number(s);
      return !isNaN(n) ? n : null;
    } else {
      return null;
    }
  }
}
