import React, {ChangeEvent} from "react";
import {Form} from "react-bootstrap";
import _ from "underscore";

export interface YearSelectorProps {
    startYear: number
    endYear: number
    value: number | null
    onChange?: (year: number | null) => void
}

export class YearSelector extends React.Component<YearSelectorProps, {}> {
    constructor(props: YearSelectorProps) {
        super(props);
        this.handleYearSelection = this.handleYearSelection.bind(this);
    }

    render() {
        return (
            <Form.Control as="select" value={this.props.value?.toString() ?? "null"}
                          onChange={this.handleYearSelection}>
                <option key="null" value="null"/>
                {
                    _.range(this.props.startYear, this.props.endYear + 1).map((i) => {
                        return (<option key={i} value={i}>{i}</option>);
                    })
                }
            </Form.Control>);
    }

    private handleYearSelection(e: ChangeEvent<HTMLInputElement>) {
        if (this.props.onChange !== undefined) {
            this.props.onChange(YearSelector.parseNumber(e.target.value));
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