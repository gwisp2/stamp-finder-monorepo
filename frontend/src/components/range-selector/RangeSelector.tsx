import React, {ChangeEvent} from "react";
import {NumberRange} from "../../model/number-range";
import {Form} from "react-bootstrap";
import "./RangeSelector.css"

export interface RangeSelectorProps {
    label?: string
    defaultRange?: NumberRange,
    onChange?: (range: NumberRange) => void
}

interface RangeSelectorState {
    startStr: string,
    endStr: string
}

export class RangeSelector extends React.Component<RangeSelectorProps, RangeSelectorState> {
    constructor(props: RangeSelectorProps) {
        super(props);
        if (this.props.defaultRange) {
            this.state = {
                startStr: this.props.defaultRange.start?.toString() ?? "",
                endStr: this.props.defaultRange.end?.toString() ?? ""
            };
        } else {
            this.state = {
                startStr: "",
                endStr: ""
            };
        }
        this.handleNumberChange = this.handleNumberChange.bind(this);
    }

    render() {
        return (<Form.Group>
            <Form.Label>{this.props.label}</Form.Label>
            <Form inline={true} className="range-selector-row">
                <Form.Label className="mr-1">От: </Form.Label>
                <Form.Control name="startStr" type="number" value={this.state.startStr} onChange={this.handleNumberChange}/>
                <Form.Label className="mr-1 ml-1">До: </Form.Label>
                <Form.Control name="endStr" type="number" value={this.state.endStr} onChange={this.handleNumberChange}/>
            </Form>
        </Form.Group>);
    }

    private handleNumberChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            [e.target.name]: e.target.value
        } as any, () => {
            if (this.props.onChange !== undefined) {
                const newRange = new NumberRange(
                    RangeSelector.parseNumber(this.state.startStr),
                    RangeSelector.parseNumber(this.state.endStr)
                );
                this.props.onChange(newRange);
            }
        });
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