import { RangeSelector } from 'components/RangeSelector';
import { Selector } from 'components/Selector';
import { ShopSelector } from 'components/ShopSelector';
import { YearRangeSelector } from 'components/YearRangeSelector';
import { ANY, NumberRange, SearchOptions, Shop, SortOrder, StampField, StampSort } from 'model';
import plural from 'plural-ru';
import React from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';

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
    const listOfCategories = [null, ...this.props.listOfCategories];

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
          <Selector
            options={listOfCategories}
            selected={this.props.options.category}
            onSelect={(cat) => this.onChange({ category: cat })}
          />
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
          <Selector
            eq="deep"
            selected={this.props.options.sort}
            renderer={(sort) => sort.name()}
            options={AllSorts}
            onSelect={(sort) => this.onChange({ sort: sort })}
          />
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
