import React, {ChangeEvent} from "react";
import {Form} from "react-bootstrap";
import _ from "underscore";

export interface YearSelectorProps {
    startYear: number
    endYear: number
    defaultYear: number | null
    onChange?: (year: number | null) => void
}

interface YearSelectorState {
    selectedYear: number | null
}

export class YearSelector extends React.Component<YearSelectorProps, YearSelectorState> {
    constructor(props: YearSelectorProps) {
        super(props);
        this.state = {
            selectedYear: props.defaultYear
        }
        this.handleYearSelection = this.handleYearSelection.bind(this);
    }

    render() {
        return (
            <Form.Control as="select" value={this.state.selectedYear?.toString() ?? "null"}
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
        this.setState({
            selectedYear: YearSelector.parseNumber(e.target.value)
        }, () => {
            if (this.props.onChange !== undefined) {
                this.props.onChange(this.state.selectedYear);
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