import UpdateIcon from '@mui/icons-material/Update';
import { ANY, Shop } from 'model';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import _ from 'underscore';
import { ShopInfoUploadDialog } from './ShopInfoUploadDialog';

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
  const [dialogShown, setDialogShown] = useState(false);

  return (
    <>
      <div className="mt-2">
        {props.allShops.map((shop) => (
          <Form.Check
            key={shop.id}
            type="checkbox"
            label={shop.displayName + (shop.reportDate !== null ? ` [${shop.reportDate}]` : '')}
            checked={
              props.selectedIds === ANY || (props.selectedIds !== null && _.contains(props.selectedIds, shop.id))
            }
            onChange={(e) => handleChange(shop.id, e.target.checked)}
          />
        ))}
      </div>
      <div className="mt-2">
        <Button
          variant="outline-secondary"
          size="sm"
          className="w-100 icon-with-text"
          onClick={() => setDialogShown(true)}
        >
          <UpdateIcon fontSize={'small'} />
          <span>Обновить</span>
        </Button>
      </div>
      <ShopInfoUploadDialog show={dialogShown} onHide={() => setDialogShown(false)} />
    </>
  );
};
