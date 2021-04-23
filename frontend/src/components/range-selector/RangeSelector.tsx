import React, {ChangeEvent} from "react";
import {NumberRange} from "../../model/number-range";
import {Form} from "react-bootstrap";
import "./RangeSelector.css"

export interface RangeSelectorProps {
    label?: string
    value: NumberRange,
    onChange?: (range: NumberRange) => void
}

interface RangeSelectorState {
    startStr: string,
    endStr: string
}

export class RangeSelector extends React.Component<RangeSelectorProps, RangeSelectorState> {
    constructor(props: RangeSelectorProps) {
        super(props);
        this.state = {
          startStr: "",
          endStr: ""
        };
        this.handleNumberChange = this.handleNumberChange.bind(this);
    }

    static getDerivedStateFromProps(props: RangeSelectorProps, currentState: RangeSelectorState) {
        let startStr = currentState.startStr;
        let endStr = currentState.endStr;
        if (props.value.start !== RangeSelector.parseNumber(startStr)) {
            startStr = props.value.start?.toString() ?? "";
        }
        if (props.value.end !== RangeSelector.parseNumber(endStr)) {
            endStr = props.value.end?.toString() ?? "";
        }
        return {
            startStr: startStr,
            endStr: endStr
        }
    }

    render() {
        return (<Form.Group>
            <Form.Label>{this.props.label}</Form.Label>
            <Form inline={true} className="range-selector-row">
                <Form.Label className="mr-1">От: </Form.Label>
                <Form.Control name="startStr" type="number" value={this.state.startStr}
                              onChange={this.handleNumberChange}/>
                <Form.Label className="mr-1 ml-1">До: </Form.Label>
                <Form.Control name="endStr" type="number" value={this.state.endStr} onChange={this.handleNumberChange}/>
            </Form>
        </Form.Group>);
    }

    private handleNumberChange(e: ChangeEvent<HTMLInputElement>) {
        let newStart = RangeSelector.parseNumber(this.state.startStr);
        let newEnd = RangeSelector.parseNumber(this.state.endStr);
        if (e.target.name === "startStr") {
            newStart = RangeSelector.parseNumber(e.target.value);
        } else if (e.target.name === "endStr") {
            newEnd = RangeSelector.parseNumber(e.target.value);
        }
        if (this.props.onChange !== undefined) {
            const newRange = new NumberRange(
                newStart,
                newEnd
            );
            this.props.onChange(newRange);
        }
    }

    private static parseNumber(s: string): number | null {
        if (s.length !== 0) {
            const n = Number(s)
            return !isNaN(n) ? n : null;
        } else {
            return null
        }
    }
}