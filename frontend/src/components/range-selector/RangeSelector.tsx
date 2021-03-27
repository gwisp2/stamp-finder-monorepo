import React from "react";
import NumericInput from "react-numeric-input";
import './RangeSelector.css'
import {NumberRange} from "../../model/number-range";

export interface RangeSelectorProps {
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
        return (<div>
            <div className="range-selector-row">
                <label>От: </label>
                <NumericInput name="startStr" value={this.state.startStr} onChange={this.handleNumberChange}/>
                <label>До: </label>
                <NumericInput name="endStr" value={this.state.endStr} onChange={this.handleNumberChange}/>
            </div>
        </div>);
    }

    private handleNumberChange(n: number | null, v: string, e: HTMLInputElement) {
        this.setState({
            [e.name]: v
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