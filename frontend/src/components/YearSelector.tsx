import React from 'react';
import _ from 'underscore';
import { Selector } from './Selector';

export interface YearSelectorProps {
  startYear: number;
  endYear: number;
  value: number | null;
  onSelect: (year: number | null) => void;
}

export const YearSelector: React.VFC<YearSelectorProps> = (props) => {
  const values = [null, ..._.range(props.startYear, props.endYear + 1).reverse()];
  return <Selector selected={props.value} options={values} onSelect={props.onSelect} />;
};
