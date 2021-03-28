import React from "react";
import {NumberRange} from "../../model/number-range";
import {SearchOptions, SortOrder, StampField, StampSort} from "../../model/stamps";
import {RangeSelector} from "../range-selector/RangeSelector";
import './StampSearcgOptionsSelector.css'
import _ from "underscore";

interface Props {
    defaultOptions: SearchOptions
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
const AllSortsNames = Array<String>(
    "По номеру", "По номеру (убывающая)", "По номиналу", "По номиналу (убывающая)"
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
        return (<div>
            <form>
                <div>Номинал:</div>
                <RangeSelector defaultRange={this.props.defaultOptions.value}
                               onChange={(r) => this.setStateAndFireOnChange({valueRange: r})}/>
                <div>Год выпуска:</div>
                <RangeSelector defaultRange={this.props.defaultOptions.year}
                               onChange={(r) => this.setStateAndFireOnChange({yearRange: r})}/>
                <div>
                    <input name="presenceRequired" id="presenceRequired" type="checkbox" checked={this.state.presenceRequired}
                           onChange={(e) => this.setStateAndFireOnChange({presenceRequired: e.target.checked})}/>
                    <label htmlFor="presenceRequired">В наличии</label>
                </div>
                <div>Сортировка:</div>
                <div>
                    <select className="stamp-search-options-sort-chooser"
                            value={this.state.sortIndex}
                            onChange={(e) => this.setStateAndFireOnChange({sortIndex: Number(e.target.value)})}>
                        {
                            _.range(0, AllSorts.length).map((i) => {
                                return (<option key={i} value={i}>{AllSortsNames[i]}</option>);
                            })
                        }
                    </select>
                </div>
            </form>
        </div>);
    }
}