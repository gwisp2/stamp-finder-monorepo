import UpdateIcon from '@mui/icons-material/Update';
import { ANY, ShopRequirement } from 'model';
import React, { useState } from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import { selectAllShops } from 'state/api.slice';
import { Shop } from 'state/api/shops';
import { useAppSelector } from 'state/hooks';
import _ from 'underscore';
import { ShopInfoUploadDialog } from './ShopInfoUploadDialog';

interface Props {
  onChange: (newValue: ShopRequirement) => void;
  value: ShopRequirement;
}

const ShopDropdown: React.VFC<Props> = (props) => {
  const handleChange = (shopId: string, checked: boolean) => {
    const prevSelectedIds = props.value === ANY ? allShops.map((s) => s.id) : props.value ?? [];
    const newSelectedIds = prevSelectedIds.filter((id) => id !== shopId);
    if (checked) {
      newSelectedIds.push(shopId);
    }
    props.onChange(
      newSelectedIds.length === allShops.length ? ANY : newSelectedIds.length === 0 ? null : newSelectedIds,
    );
  };

  const [dialogShown, setDialogShown] = useState(false);
  const allShops = useAppSelector(selectAllShops);
  const isShopSelected = (shop: Shop) =>
    props.value === ANY || (props.value !== null && _.contains(props.value, shop.id));

  return (
    <>
      <div className="mt-2">
        {allShops.map((shop) => (
          <Form.Check
            key={shop.id}
            type="checkbox"
            label={shop.displayName + (shop.reportDate !== null ? ` [${shop.reportDate}]` : '')}
            checked={isShopSelected(shop)}
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

export const ShopSelector: React.VFC<Props & { label: string; className?: string }> = React.memo((props) => {
  return (
    <div className={props.className}>
      <Form.Label>
        <span className="me-1">{props.label}</span>
        <ButtonGroup size="sm" aria-label="Номиналы" className="ms-1">
          <Button variant="outline-secondary" onClick={() => props.onChange(null)}>
            Не обязательно
          </Button>
          <Button variant="outline-secondary" onClick={() => props.onChange(ANY)}>
            Где угодно
          </Button>
        </ButtonGroup>
      </Form.Label>
      <ShopDropdown value={props.value} onChange={props.onChange} />
    </div>
  );
});
