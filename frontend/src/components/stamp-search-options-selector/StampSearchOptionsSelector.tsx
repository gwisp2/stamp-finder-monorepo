import React from 'react';
import { SearchOptions, SortOrder, StampField, StampSort } from '../../model/stamps';
import { RangeSelector } from '../range-selector/RangeSelector';
import _ from 'underscore';
import { Button, ButtonGroup, Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { YearRangeSelector } from '../year-selector/YearRangeSelector';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import './StampSearchOptionsSelector.css';
import plural from 'plural-ru';
import { NumberRange } from '../../model/number-range';

interface Props {
  startYear: number;
  endYear: number;
  options: SearchOptions;
  numberOfFoundStamps?: number;
  listOfCategories: Array<string>;
  onChange: (newOptions: SearchOptions) => void;
}

const AllSorts = Array<StampSort>(
  new StampSort(StampField.Id, SortOrder.Natural),
  new StampSort(StampField.Id, SortOrder.Reversed),
  new StampSort(StampField.Value, SortOrder.Natural),
  new StampSort(StampField.Value, SortOrder.Reversed),
);
const AllSortsNames = Array<React.ReactNode>(
  <span>
    По номеру <ArrowUpwardIcon />
  </span>,
  <span>
    По номеру <ArrowDownwardIcon />
  </span>,
  <span>
    По номиналу <ArrowUpwardIcon />
  </span>,
  <span>
    По номиналу <ArrowDownwardIcon />
  </span>,
);

export class StampSearchOptionsSelector extends React.Component<Props, {}> {
  private onChange(
    change: Partial<{
      valueRange: NumberRange;
      yearRange: NumberRange;
      category: string | null;
      presenceRequired: boolean;
      contains: string;
      sort: StampSort;
    }>,
  ) {
    let options = {
      valueRange: this.props.options.value,
      yearRange: this.props.options.year,
      category: this.props.options.category,
      presenceRequired: this.props.options.presenceRequired,
      sort: this.props.options.sort,
      contains: this.props.options.contains,
      ...change,
    };
    this.props.onChange(
      new SearchOptions(
        options.valueRange,
        options.yearRange,
        options.category,
        options.presenceRequired,
        options.contains,
        options.sort,
      ),
    );
  }

  render() {
    const valueButtons = [18, 52].map((value) => (
      <Button variant="outline-secondary" onClick={(r) => this.onChange({ valueRange: new NumberRange(value, value) })}>
        {value}
      </Button>
    ));
    valueButtons.push(
      <Button
        variant="outline-secondary"
        className="btn btn-outline-secondary"
        onClick={(r) => this.onChange({ valueRange: new NumberRange(null, null) })}
      >
        Все
      </Button>,
    );
    const sortIndex = _.findIndex(AllSorts, this.props.options.sort);
    return (
      <div>
        <RangeSelector
          className="mb-3"
          label={
            <div>
              Номинал:{' '}
              <button className="d-none">
                For some reason the first button becomes dark when any button is hovered, this hidden button hides this
                issue
              </button>
              <ButtonGroup size="sm" aria-label="Номиналы" className="ms-1">
                {valueButtons}
              </ButtonGroup>
            </div>
          }
          value={this.props.options.value}
          onChange={(r) => this.onChange({ valueRange: r })}
        />
        <YearRangeSelector
          className="mb-3"
          label="Год выпуска:"
          startYear={this.props.startYear}
          endYear={this.props.endYear}
          value={this.props.options.year}
          onChange={(r) => this.onChange({ yearRange: r })}
        />
        <Form.Group className="mb-3">
          <Form.Label>Название содержит:</Form.Label>
          <Form>
            <Form.Control
              name="contains"
              type="text"
              className="w-100"
              value={this.props.options.contains}
              onChange={(e) => this.onChange({ contains: e.target.value })}
            />
          </Form>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Рубрика:</Form.Label>
          <DropdownButton variant="custom-white" title={this.props.options.category ?? '[не задана]'}>
            <Dropdown.Item onSelect={() => this.onChange({ category: null })}>[не задана]</Dropdown.Item>
            {this.props.listOfCategories.map((cat) => {
              return (
                <Dropdown.Item key={cat} onSelect={() => this.onChange({ category: cat })}>
                  {cat}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </Form.Group>
        <Form.Group className="mb-3" controlId="soss-present">
          <Form.Check
            type="checkbox"
            label="В наличии"
            checked={this.props.options.presenceRequired}
            onChange={(e) => this.onChange({ presenceRequired: e.target.checked })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Сортировка:</Form.Label>
          <DropdownButton variant="custom-white" title={AllSortsNames[sortIndex]}>
            {_.range(0, AllSorts.length).map((i) => {
              return (
                <Dropdown.Item key={i} onSelect={() => this.onChange({ sort: AllSorts[i] })}>
                  {AllSortsNames[i]}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </Form.Group>
        {this.props.numberOfFoundStamps !== undefined ? (
          <Form.Text>
            По запросу {plural(this.props.numberOfFoundStamps, 'найдена', 'найдено', 'найдено')}{' '}
            {this.props.numberOfFoundStamps} {plural(this.props.numberOfFoundStamps, 'марка', 'марки', 'марок')}.
          </Form.Text>
        ) : (
          ''
        )}
      </div>
    );
  }
}
