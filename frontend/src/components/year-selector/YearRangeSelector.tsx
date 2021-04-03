import React from "react";
import {NumberRange} from "../../model/number-range";
import {Form} from "react-bootstrap";
import {YearSelector} from "./YearSelector";
import "./YearRangeSelector.css";

export interface YearRangeSelectorProps {
    label?: string
    startYear: number
    endYear: number
    defaultRange: NumberRange
    onChange?: (range: NumberRange) => void
}

interface YearRangeSelectorPropsState {
    selectedStartYear: number | null
    selectedEndYear: number | null
}

export class YearRangeSelector extends React.Component<YearRangeSelectorProps, YearRangeSelectorPropsState> {
    constructor(props: YearRangeSelectorProps) {
        super(props);
        this.state = {
            selectedStartYear: this.props.defaultRange.start,
            selectedEndYear: this.props.defaultRange.end
        };
        this.runOnChangeHandler = this.runOnChangeHandler.bind(this);
    }

    private runOnChangeHandler() {
        if (this.props.onChange) {
            this.props.onChange(new NumberRange(
                this.state.selectedStartYear,
                this.state.selectedEndYear
            ));
        }
    }

    render() {
        return (<Form.Group>
            <Form.Label>{this.props.label}</Form.Label>
            <Form inline={true} className="year-range-selector-row">
                <Form.Label className="mr-1">От: </Form.Label>
                <YearSelector startYear={this.props.startYear} endYear={this.state.selectedEndYear ?? this.props.endYear}
                              defaultYear={this.props.defaultRange.start}
                              onChange={(v) => {
                                  this.setState({
                                      selectedStartYear: v
                                  }, this.runOnChangeHandler);
                              }}
                />
                <Form.Label className="mr-1 ml-1">До: </Form.Label>
                <YearSelector startYear={this.state.selectedStartYear ?? this.props.startYear} endYear={this.props.endYear}
                              defaultYear={this.props.defaultRange.end}
                              onChange={(v) => {
                                  this.setState({
                                      selectedEndYear: v
                                  }, this.runOnChangeHandler);
                              }}/>
            </Form>
        </Form.Group>);
    }
}