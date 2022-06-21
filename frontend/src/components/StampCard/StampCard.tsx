import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import { CustomDropdownToggle } from 'components/CustomToggle';
import { Stamp } from 'model';
import React from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import styled from 'styled-components';
import _ from 'underscore';
import EmptyImage from './empty.png';
import './StampCard.css';
import { StampInfoDropdown } from './StampInfoDropdown';

export const ShopItemsDropdown: React.VFC<{ stamp: Stamp; options: CardDisplayOptions }> = (props) => {
  const stamp = props.stamp;

  const items = stamp.itemsGroupedByShops();
  const highlightedShops = props.options.highlightedShops;
  const interestingItems =
    highlightedShops !== undefined ? items.filter((p) => _.contains(highlightedShops, p[0].id)) : items;
  const otherItems = items.filter((p) => !_.includes(interestingItems, p));

  const color = items.length !== 0 ? 'success' : 'secondary';
  return (
    <Dropdown className="w-100" as={ButtonGroup} align="end">
      <Button variant={color} href={stamp.page.href} className="icon-with-text">
        <ShoppingBasket fontSize={'small'} /> <span className="ms-1">В магазин</span>
      </Button>
      {items.length !== 0 && <CustomDropdownToggle variant={color}>{interestingItems.length}</CustomDropdownToggle>}
      {items.length !== 0 && (
        <Dropdown.Menu>
          {interestingItems.map(([shop, shopItems]) => (
            <Dropdown.Item key={shop.id} href={shop.link}>
              {shop.displayName}: {shopItems.map((i) => i.name).join(', ')}
            </Dropdown.Item>
          ))}
          {otherItems.length !== 0 && <Dropdown.Divider />}
          {otherItems.map(([shop, shopItems]) => (
            <Dropdown.Item key={shop.id} href={shop.link}>
              {shop.displayName}: {shopItems.map((i) => i.name).join(', ')}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );
};

const StampCardHeader: React.VFC<{ stamp: Stamp }> = (props) => {
  const s = props.stamp;
  return (
    <div className="mb-1 ps-1 d-flex justify-content-between border-bottom align-items-center">
      <strong>
        №{s.id} {s.value}₽ {s.year}
      </strong>
      <StampInfoDropdown stamp={props.stamp} />
    </div>
  );
};

const FillParentImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;
const SquareImage: React.VFC<{ alt: string; url: string | null; className: string }> = (props) => {
  return (
    <div className={`ratio ratio-1x1 ${props.className}`}>
      <FillParentImage
        loading="lazy"
        draggable="false"
        alt={props.alt}
        className="stamp-image"
        src={props.url ?? EmptyImage}
      />
    </div>
  );
};

export interface CardDisplayOptions {
  highlightedShops?: string[];
}

export const StampCard: React.VFC<{ stamp: Stamp; options: CardDisplayOptions }> = React.memo((props) => {
  const s = props.stamp;
  return (
    <div className="position-relative shadow-sm bg-light border border-secondary rounded p-2">
      <StampCardHeader stamp={s} />
      <SquareImage alt={'Image of stamp ' + s.id} url={s.imageUrl} className="mb-1" />
      <ShopItemsDropdown stamp={s} options={props.options} />
    </div>
  );
});
