import React from 'react';
import { Form } from 'react-bootstrap';
import _ from 'underscore';
import { Shop } from '../../model/shops';
import { ANY } from '../../model/stamps';

export interface ShopSelectorProps {
  allShops: Shop[];
  selectedIds: null | string[] | typeof ANY;
  onChange: (options: null | string[] | typeof ANY) => void;
}

export class ShopSelector extends React.Component<ShopSelectorProps, Record<string, never>> {
  render(): React.ReactNode {
    console.log(this.props.allShops);
    return (
      <div>
        {this.props.allShops.map((shop) => (
          <Form.Check
            key={shop.id}
            type="checkbox"
            label={shop.displayName + (shop.reportDate !== null ? ` [${shop.reportDate}]` : '')}
            checked={
              this.props.selectedIds === ANY ||
              (this.props.selectedIds !== null && _.contains(this.props.selectedIds, shop.id))
            }
            onChange={(e) => this.onChange(shop.id, e.target.checked)}
          />
        ))}
      </div>
    );
  }

  private onChange(shopId: string, checked: boolean) {
    const prevSelectedIds =
      this.props.selectedIds === ANY ? this.props.allShops.map((s) => s.id) : this.props.selectedIds ?? [];
    const newSelectedIds = prevSelectedIds.filter((id) => id !== shopId);
    if (checked) {
      newSelectedIds.push(shopId);
    }
    this.props.onChange(
      newSelectedIds.length === this.props.allShops.length ? ANY : newSelectedIds.length === 0 ? null : newSelectedIds,
    );
  }
}
