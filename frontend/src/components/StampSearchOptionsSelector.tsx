import { Selector } from 'components/Selector';
import { ShopSelector } from 'components/ShopSelector';
import { YearRangeSelector } from 'components/YearRangeSelector';
import { SearchOptions } from 'model';
import React, { ReactNode, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { selectAllStamps } from 'state/api.slice';
import { useAppSelector } from 'state/hooks';
import _ from 'underscore';
import { SortSelector } from './SortSelector';
import { StampValueChooser } from './StampValueChooser';

interface Props {
  options: SearchOptions;
  onChange: (newOptions: SearchOptions) => void;
  bottomInfo?: ReactNode;
}

const useStampsStats = () => {
  return useAppSelector((state) => {
    const stamps = selectAllStamps(state);
    const stampYears = stamps.map((s) => s.year).filter((y): y is number => y !== null);
    const stampCategories = _.sortBy(_.unique(stamps.flatMap((s) => s.categories)));
    return { minYear: _.min(stampYears), maxYear: _.max(stampYears), categories: stampCategories };
  }, _.isEqual);
};

const ShortcutValues = [18, 62];

export const StampSearchOptionsSelector: React.VFC<Props> = React.memo((props) => {
  const { minYear, maxYear, categories } = useStampsStats();
  const onChange = (change: Partial<SearchOptions>) => props.onChange(props.options.applyChange(change));
  const onOptionChangeCallback = <T extends keyof SearchOptions>(optionName: T) =>
    useCallback((v: SearchOptions[T]) => onChange({ [optionName]: v }), [props.onChange]);
  return (
    <div>
      <StampValueChooser
        className="mb-3"
        value={props.options.value}
        onChange={onOptionChangeCallback('value')}
        shortcutValues={ShortcutValues}
        label="Номинал:"
      />
      <YearRangeSelector
        className="mb-3"
        label="Год выпуска:"
        startYear={minYear}
        endYear={maxYear}
        value={props.options.year}
        onChange={onOptionChangeCallback('year')}
      />
      <div className="mb-3">
        <Form.Label>Название содержит:</Form.Label>
        <div>
          <Form.Control
            name="contains"
            type="text"
            className="w-100"
            value={props.options.contains}
            onChange={(e) => onChange({ contains: e.target.value })}
          />
        </div>
      </div>
      <div className="mb-3">
        <Form.Label>Рубрика:</Form.Label>
        <Selector
          options={[null, ...categories]}
          selected={props.options.category}
          onSelect={onOptionChangeCallback('category')}
        />
      </div>
      <ShopSelector
        label="Наличие:"
        className="mb-3"
        value={props.options.presenceRequired}
        onChange={onOptionChangeCallback('presenceRequired')}
      />
      <SortSelector
        label="Сортировка:"
        className="mb-3"
        value={props.options.sort}
        onChange={onOptionChangeCallback('sort')}
      />
      {props.bottomInfo}
    </div>
  );
});
StampSearchOptionsSelector.displayName = 'StampSearchOptionsSelector';
