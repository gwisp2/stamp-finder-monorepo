import React from 'react';
import { SearchOptions, SortOrder, StampField, StampSort, ANY, NumberRange, Shop } from 'model';
import { RangeSelector } from 'components/RangeSelector';
import _ from 'underscore';
import { Button, ButtonGroup, Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { YearRangeSelector } from 'components/YearRangeSelector';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import './StampSearchOptionsSelector.css';
import plural from 'plural-ru';
import { ShopSelector } from 'components/ShopSelector';

interface Props {
  startYear: number;
  endYear: number;
  options: SearchOptions;
  numberOfFoundStamps?: number;
  listOfCategories: Array<string>;
  listOfShops: Array<Shop>;
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

export class StampSearchOptionsSelector extends React.Component<Props> {
  private onChange(
    change: Partial<{
      valueRange: NumberRange;
      yearRange: NumberRange;
      category: string | null;
      presenceRequired: null | string[] | typeof ANY;
      contains: string;
      sort: StampSort;
    }>,
  ) {
    const options = {
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

  render(): React.ReactNode {
    const valueButtons = [18, 55].map((value) => (
      <Button
        variant="outline-secondary"
        key={`V${value}`}
        onClick={() => this.onChange({ valueRange: new NumberRange(value, value) })}
      >
        {value}
      </Button>
    ));
    valueButtons.push(
      <Button
        key="VAny"
        variant="outline-secondary"
        className="btn btn-outline-secondary"
        onClick={() => this.onChange({ valueRange: new NumberRange(null, null) })}
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
        <div className="mb-3">
          <Form.Label>Название содержит:</Form.Label>
          <div>
            <Form.Control
              name="contains"
              type="text"
              className="w-100"
              value={this.props.options.contains}
              onChange={(e) => this.onChange({ contains: e.target.value })}
            />
          </div>
        </div>
        <div className="mb-3">
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
        </div>
        <div className="mb-3">
          <Form.Label>
            Наличие:{' '}
            <ButtonGroup size="sm" aria-label="Номиналы" className="ms-1">
              <button className="d-none">
                For some reason the first button becomes dark when any button is hovered, this hidden button hides this
                issue
              </button>
              <Button variant="outline-secondary" onClick={() => this.onChange({ presenceRequired: null })}>
                Не обязательно
              </Button>
              <Button variant="outline-secondary" onClick={() => this.onChange({ presenceRequired: ANY })}>
                Где угодно
              </Button>
            </ButtonGroup>
          </Form.Label>
          <ShopSelector
            allShops={this.props.listOfShops}
            selectedIds={this.props.options.presenceRequired}
            onChange={(e) => this.onChange({ presenceRequired: e })}
          />
        </div>
        <div className="mb-3">
          <Form.Label>Сортировка:</Form.Label>
          <DropdownButton variant="custom-white" title={AllSortsNames[sortIndex]}>
            {_.range(0, AllSorts.length).map((i) => {
              return (
                <Dropdown.Item key={i} onClick={() => this.onChange({ sort: AllSorts[i] })}>
                  {AllSortsNames[i]}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </div>
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
