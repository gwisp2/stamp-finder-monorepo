import React from "react";
import {SearchOptions, SortOrder, StampField, StampSort} from "../../model/stamps";
import {RangeSelector} from "../range-selector/RangeSelector";
import _ from "underscore";
import {Dropdown, DropdownButton, Form} from "react-bootstrap";
import {YearRangeSelector} from "../year-selector/YearRangeSelector";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import "./StampSearchOptionsSelector.css";
import plural from 'plural-ru'
import {NumberRange} from "../../model/number-range";

interface Props {
    startYear: number
    endYear: number
    options: SearchOptions
    numberOfFoundStamps?: number
    listOfCategories: Array<string>
    onChange: (newOptions: SearchOptions) => void
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

export class StampSearchOptionsSelector extends React.Component<Props, {}> {
    private onChange(change: Partial<{
        valueRange: NumberRange,
        yearRange: NumberRange,
        category: string|null,
        presenceRequired: boolean,
        sort: StampSort
    }>) {
        let options = {
            valueRange: this.props.options.value,
            yearRange: this.props.options.year,
            category: this.props.options.category,
            presenceRequired: this.props.options.presenceRequired,
            sort: this.props.options.sort,
            ...change
        };
        this.props.onChange(new SearchOptions(
            options.valueRange, options.yearRange, options.category, options.presenceRequired, options.sort
        ))
    }

    render() {
        const sortIndex = _.findIndex(AllSorts, this.props.options.sort);
        return (
            <div>
                <RangeSelector label="Номинал:"
                               value={this.props.options.value}
                               onChange={(r) => this.onChange({valueRange: r})}/>
                <YearRangeSelector label="Год выпуска:"
                                   startYear={this.props.startYear}
                                   endYear={this.props.endYear}
                                   value={this.props.options.year}
                                   onChange={(r) => this.onChange({yearRange: r})}/>
                <Form.Group>
                    <Form.Label>Рубрика:</Form.Label>
                    <DropdownButton variant="custom-white" title={this.props.options.category ?? "[не задана]"}>
                        <Dropdown.Item onSelect={() => this.onChange({category: null})}>[не задана]</Dropdown.Item>
                        {
                            this.props.listOfCategories.map((cat) => {
                                return (<Dropdown.Item key={cat} onSelect={() =>
                                    this.onChange({category: cat})
                                }>{cat}</Dropdown.Item>);
                            })
                        }
                    </DropdownButton>
                </Form.Group>
                <Form.Group controlId="soss-present">
                    <Form.Check type="checkbox" label="В наличии"
                                checked={this.props.options.presenceRequired}
                                onChange={(e) => this.onChange({presenceRequired: e.target.checked})}/>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Сортировка:</Form.Label>
                    <DropdownButton variant="custom-white" title={AllSortsNames[sortIndex]}>
                        {
                            _.range(0, AllSorts.length).map((i) => {
                                return (<Dropdown.Item key={i} onSelect={() =>
                                    this.onChange({sort: AllSorts[i]})
                                }>{AllSortsNames[i]}</Dropdown.Item>);
                            })
                        }
                    </DropdownButton>
                </Form.Group>
                {
                    this.props.numberOfFoundStamps !== undefined ? (
                        <Form.Text>По запросу {
                            plural(this.props.numberOfFoundStamps, "найдена", "найдено", "найдено")
                        } {
                            this.props.numberOfFoundStamps
                        } {
                            plural(this.props.numberOfFoundStamps, "марка", "марки", "марок")
                        }.</Form.Text>
                    ) : ""
                }
            </div>);
    }
}