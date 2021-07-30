import React, { ChangeEvent } from 'react';
import { NumberRange } from '../../model/number-range';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import './RangeSelector.css';

export interface RangeSelectorProps {
  className?: string;
  label?: React.ReactNode;
  value: NumberRange;
  onChange?: (range: NumberRange) => void;
}

interface RangeSelectorState {
  startStr: string;
  endStr: string;
}

export class RangeSelector extends React.Component<RangeSelectorProps, RangeSelectorState> {
  constructor(props: RangeSelectorProps) {
    super(props);
    this.state = {
      startStr: '',
      endStr: '',
    };
    this.handleNumberChange = this.handleNumberChange.bind(this);
  }

  static getDerivedStateFromProps(props: RangeSelectorProps, currentState: RangeSelectorState) {
    let startStr = currentState.startStr;
    let endStr = currentState.endStr;
    const range = props.value;
    if (range.start !== RangeSelector.parseNumber(startStr)) {
      startStr = range.start?.toString() ?? '';
    }
    if (range.end !== RangeSelector.parseNumber(endStr)) {
      endStr = range.end?.toString() ?? '';
    }
    return {
      startStr: startStr,
      endStr: endStr,
    };
  }

  render() {
    return (
      <Form.Group className={this.props.className}>
        <Form className="range-selector-row mb-2">
          {this.props.label}
          <DropdownButton
            variant="custom-white"
            title={this.props.value.exact ? 'Ровно' : 'Между'}
            size="sm"
            className="ms-2"
          >
            <Dropdown.Item onSelect={() => this.setExact(true)}>Ровно</Dropdown.Item>
            <Dropdown.Item onSelect={() => this.setExact(false)}>Между</Dropdown.Item>
          </DropdownButton>
        </Form>
        {!this.props.value.exact ? (
          <Form className="range-selector-row">
            <Form.Label className="me-1">От: </Form.Label>
            <Form.Control
              name="startStr"
              type="number"
              value={this.state.startStr}
              onChange={this.handleNumberChange}
            />
            <Form.Label className="me-1 ms-1">До: </Form.Label>
            <Form.Control name="endStr" type="number" value={this.state.endStr} onChange={this.handleNumberChange} />
          </Form>
        ) : (
          <Form className="range-selector-row">
            <Form.Control
              name="exactStr"
              type="number"
              value={this.state.startStr}
              onChange={this.handleNumberChange}
            />
          </Form>
        )}
      </Form.Group>
    );
  }

  private setExact(exact: boolean) {
    if (this.props.onChange !== undefined) {
      const newRange = exact
        ? NumberRange.exact(this.props.value.start)
        : NumberRange.between(this.props.value.start, this.props.value.end);
      this.props.onChange(newRange);
    }
  }

  private handleNumberChange(e: ChangeEvent<HTMLInputElement>) {
    let newStart = RangeSelector.parseNumber(this.state.startStr);
    let newEnd = RangeSelector.parseNumber(this.state.endStr);
    if (e.target.name === 'startStr') {
      newStart = RangeSelector.parseNumber(e.target.value);
    } else if (e.target.name === 'endStr') {
      newEnd = RangeSelector.parseNumber(e.target.value);
    } else if (e.target.name === 'exactStr') {
      const value = RangeSelector.parseNumber(e.target.value);
      newStart = value;
      newEnd = value;
    }
    if (this.props.onChange !== undefined) {
      const newRange = this.props.value.exact ? NumberRange.exact(newStart) : NumberRange.between(newStart, newEnd);
      this.props.onChange(newRange);
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
