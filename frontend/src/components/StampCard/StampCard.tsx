import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import { CustomDropdownToggle } from 'components/CustomToggle';
import { SearchOptions, Stamp } from 'model';
import React from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import styled from 'styled-components';
import _ from 'underscore';
import EmptyImage from './empty.png';
import './StampCard.css';

const CustomToggleSpan = styled.span`
  color: black;
  text-decoration: none !important;

  :hover,
  :active {
    color: blue;
  }
`;
const CustomToggle = React.forwardRef<
  HTMLAnchorElement,
  { onClick: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void }
>((props, ref) => (
  <CustomToggleSpan
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      props.onClick(e);
    }}
  >
    <ArrowDropDown />
  </CustomToggleSpan>
));

export const StampCardDropdown: React.VFC<{ stamp: Stamp }> = (props) => {
  const s = props.stamp;
  return (
    <Dropdown align="end">
      <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
      <Dropdown.Menu className="stamp-card-dropdown">
        {s.categories.length !== 0 && (
          <div className="stamp-card-labelvalue">
            <span className="label">Категории</span>
            <span className="value">{s.categories.join(', ')}</span>
          </div>
        )}
        {s.series && (
          <div className="stamp-card-labelvalue">
            <span className="label">Серия</span>
            <span className="value">{s.series}</span>
          </div>
        )}
        {s.name && (
          <div className="stamp-card-labelvalue">
            <span className="label">Название</span>
            <span className="value">{s.name}</span>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export const ShopItemsDropdown: React.VFC<{ stamp: Stamp; searchOptions?: SearchOptions }> = (props) => {
  const stamp = props.stamp;

  const items = stamp.itemsGroupedByShops();
  const interestingItems = items.filter(
    (p) => props.searchOptions === undefined || props.searchOptions.isShopInteresting(p[0]),
  );
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

const StampCardHeaderContainer = styled.div.attrs(() => ({
  className: 'mb-1 d-flex justify-content-between',
}))`
  font-weight: bold;
  padding-left: 5px;
  margin-right: -2px;
`;
const StampCardHeader: React.VFC<{ stamp: Stamp }> = (props) => {
  const s = props.stamp;
  return (
    <StampCardHeaderContainer>
      <div>
        №{s.id} {s.value}₽ {s.year}
      </div>
      <div>
        <StampCardDropdown stamp={props.stamp} />
      </div>
    </StampCardHeaderContainer>
  );
};

const SquareImageContainer = styled.div`
  position: relative;
`;
// % of padding-top is relative to parent _width_. As a result parent height becomes equal to parent width.
const SquareImageContainerSpacer = styled.div`
  padding-top: 100%;
`;
const FillParentImage = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;
const SquareImage: React.VFC<{ alt: string; url: URL | null; className?: string }> = (props) => {
  return (
    <SquareImageContainer className={props.className}>
      <SquareImageContainerSpacer />
      <FillParentImage
        loading="lazy"
        draggable="false"
        alt={props.alt}
        className="stamp-image"
        src={(props.url ?? EmptyImage).toString()}
      />
    </SquareImageContainer>
  );
};

export const StampCard: React.VFC<{ stamp: Stamp; searchOptions?: SearchOptions }> = (props) => {
  const s = props.stamp;
  return (
    <div className="position-relative shadow-sm bg-light border border-secondary rounded p-2">
      <StampCardHeader stamp={s} />
      <SquareImage alt={'Image of stamp ' + s.id} url={s.imageUrl} className="mb-1" />
      <ShopItemsDropdown stamp={s} searchOptions={props.searchOptions} />
    </div>
  );
};
