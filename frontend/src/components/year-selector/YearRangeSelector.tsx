import React from "react";
import {NumberRange} from "../../model/number-range";
import {Form} from "react-bootstrap";
import {YearSelector} from "./YearSelector";
import "./YearRangeSelector.css";

export interface YearRangeSelectorProps {
    label?: string
    startYear: number
    endYear: number
    value: NumberRange
    onChange?: (range: NumberRange) => void
}

export class YearRangeSelector extends React.Component<YearRangeSelectorProps, {}> {
    constructor(props: YearRangeSelectorProps) {
        super(props);
        this.runOnChangeHandler = this.runOnChangeHandler.bind(this);
    }

    private runOnChangeHandler(change: Partial<{start: number|null, end: number|null}>) {
        let range = {
            start: this.props.value.start,
            end: this.props.value.end,
            ...change
        };
        if (this.props.onChange) {
            this.props.onChange(new NumberRange(
                range.start,
                range.end
            ));
        }
    }

    render() {
        return (<Form.Group>
            <Form.Label>{this.props.label}</Form.Label>
            <Form inline={true} className="year-range-selector-row">
                <Form.Label className="mr-1">От: </Form.Label>
                <YearSelector startYear={this.props.startYear} endYear={this.props.value.end ?? this.props.endYear}
                              value={this.props.value.start}
                              onChange={(v) => this.runOnChangeHandler({start: v})}
                />
                <Form.Label className="mr-1 ml-1">До: </Form.Label>
                <YearSelector startYear={this.props.value.start ?? this.props.startYear} endYear={this.props.endYear}
                              value={this.props.value.end}
                              onChange={(v) => this.runOnChangeHandler({end: v})}/>
            </Form>
        </Form.Group>);
    }
}