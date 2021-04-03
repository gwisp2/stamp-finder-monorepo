import React from "react";
import {NumberRange} from "../../model/number-range";
import {SearchOptions, SortOrder, StampField, StampSort} from "../../model/stamps";
import {RangeSelector} from "../range-selector/RangeSelector";
import _ from "underscore";
import {Dropdown, DropdownButton, Form} from "react-bootstrap";
import {YearRangeSelector} from "../year-selector/YearRangeSelector";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import "./StampSearchOptionsSelector.css";
import plural from 'plural-ru'

interface Props {
    startYear: number
    endYear: number
    defaultOptions: SearchOptions
    numberOfFoundStamps?: number
    onChange: (newOptions: SearchOptions) => void
}

interface State {
    valueRange: NumberRange,
    yearRange: NumberRange,
    presenceRequired: boolean,
    sortIndex: number
}

const AllSorts = Array<StampSort>(
    new StampSort(StampField.Id, SortOrder.Natural),
    new StampSort(StampField.Id, SortOrder.Reversed),
    new StampSort(StampField.Value, SortOrder.Natural),
    new StampSort(StampField.Value, SortOrder.Reversed)
);
const AllSortsNames = Array<React.ReactNode>(
    <span>По номеру <ArrowUpwardIcon/></span>,
    <span>По номеру <ArrowDownwardIcon/></span>,
    <span>По номиналу <ArrowUpwardIcon/></span>,
    <span>По номиналу <ArrowDownwardIcon/></span>
);

export class StampSearchOptionsSelector extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            valueRange: this.props.defaultOptions.value,
            yearRange: this.props.defaultOptions.year,
            presenceRequired: this.props.defaultOptions.presenceRequired,
            sortIndex: _.findIndex(AllSorts, this.props.defaultOptions.sort)
        };
    }

    private setStateAndFireOnChange<K extends keyof State>(p: Pick<State, K>) {
        this.setState(p, () => {
            this.props.onChange(new SearchOptions(
                this.state.valueRange,
                this.state.yearRange,
                this.state.presenceRequired,
                AllSorts[this.state.sortIndex]
            ));
        });
    }

    render() {
        return (
            <div>
                <RangeSelector label="Номинал:"
                               defaultRange={this.props.defaultOptions.value}
                               onChange={(r) => this.setStateAndFireOnChange({valueRange: r})}/>
                <YearRangeSelector label="Год выпуска:"
                                   startYear={this.props.startYear}
                                   endYear={this.props.endYear}
                                   defaultRange={this.props.defaultOptions.year}
                                   onChange={(r) => this.setStateAndFireOnChange({yearRange: r})}/>
                <Form.Group controlId="soss-present">
                    <Form.Check type="checkbox" label="В наличии"
                                onChange={(e) => this.setStateAndFireOnChange({presenceRequired: e.target.checked})}/>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Сортировка:</Form.Label>
                    <DropdownButton variant="custom-white" title={AllSortsNames[this.state.sortIndex]}>
                        {
                            _.range(0, AllSorts.length).map((i) => {
                                return (<Dropdown.Item key={i} onSelect={() =>
                                    this.setStateAndFireOnChange({sortIndex: i})
                                }>{AllSortsNames[i]}</Dropdown.Item>);
                            })
                        }
                    </DropdownButton>
                </Form.Group>
                {
                    this.props.numberOfFoundStamps !== undefined ? (
                        <Form.Text>По запросу найдено {this.props.numberOfFoundStamps} {
                            plural(this.props.numberOfFoundStamps, "марка", "марки", "марок")
                        }.</Form.Text>
                    ): ""
                }
            </div>);
    }
}