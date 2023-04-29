import _ from 'lodash';
import React from 'react';
import { Selector } from './Selector';

export interface YearSelectorProps {
  startYear: number;
  endYear: number;
  value: number | null;
  onSelect: (year: number | null) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = React.memo((props) => {
  const values = [null, ..._.range(props.startYear, props.endYear + 1).reverse()];
  return <Selector selected={props.value} options={values} onSelect={props.onSelect} />;
});
YearSelector.displayName = 'YearSelector';
