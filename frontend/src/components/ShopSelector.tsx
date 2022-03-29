import React from 'react';
import { Form } from 'react-bootstrap';
import _ from 'underscore';
import { ANY, Shop } from 'model';

export interface ShopSelectorProps {
  allShops: Shop[];
  selectedIds: null | string[] | typeof ANY;
  onChange: (options: null | string[] | typeof ANY) => void;
}

export const ShopSelector: React.VFC<ShopSelectorProps> = (props) => {
  const handleChange = (shopId: string, checked: boolean) => {
    const prevSelectedIds = props.selectedIds === ANY ? props.allShops.map((s) => s.id) : props.selectedIds ?? [];
    const newSelectedIds = prevSelectedIds.filter((id) => id !== shopId);
    if (checked) {
      newSelectedIds.push(shopId);
    }
    props.onChange(
      newSelectedIds.length === props.allShops.length ? ANY : newSelectedIds.length === 0 ? null : newSelectedIds,
    );
  };

  return (
    <div>
      {props.allShops.map((shop) => (
        <Form.Check
          key={shop.id}
          type="checkbox"
          label={shop.displayName + (shop.reportDate !== null ? ` [${shop.reportDate}]` : '')}
          checked={props.selectedIds === ANY || (props.selectedIds !== null && _.contains(props.selectedIds, shop.id))}
          onChange={(e) => handleChange(shop.id, e.target.checked)}
        />
      ))}
    </div>
  );
};
