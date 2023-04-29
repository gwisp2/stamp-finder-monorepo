import { Shop, useSfDatabase } from 'api/SfDatabase';
import _ from 'lodash';
import { ANY, ShopRequirement } from 'model';
import React from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';

interface Props {
  onChange: (newValue: ShopRequirement) => void;
  value: ShopRequirement;
}

const ShopDropdown: React.FC<Props> = (props) => {
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

  const allShops = useSfDatabase().shops;
  const isShopSelected = (shop: Shop) =>
    props.value === ANY || (props.value !== null && _.includes(props.value, shop.id));

  return (
    <>
      <div className="mt-2">
        {allShops.map((shop: Shop) => (
          <Form.Check
            key={shop.id}
            type="checkbox"
            label={shop.displayName + (shop.reportDate !== null ? ` [${shop.reportDate}]` : '')}
            checked={isShopSelected(shop)}
            onChange={(e) => handleChange(shop.id, e.target.checked)}
          />
        ))}
      </div>
    </>
  );
};

export const ShopSelector: React.FC<Props & { label: string; className?: string }> = React.memo((props) => {
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
ShopSelector.displayName = 'ShopSelector';
