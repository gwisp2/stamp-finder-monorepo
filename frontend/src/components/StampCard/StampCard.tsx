import React from 'react';
import { Stamp } from 'model';
import './StampCard.css';
import EmptyImage from './empty.png';
import ShoppingBasket from '@material-ui/icons/ShoppingBasket';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import _ from 'underscore';

export interface Props {
  stamp: Stamp;
}

const CustomToggle = React.forwardRef<
  HTMLAnchorElement,
  { onClick: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void }
>((props, ref) => (
  <span
    className="card-dropdown-toggle"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      props.onClick(e);
    }}
  >
    <ArrowDropDown />
  </span>
));

export class StampCardDropdown extends React.Component<Props> {
  render(): React.ReactNode {
    const s = this.props.stamp;
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
  }
}

export class ShopItemsDropdown extends React.Component<Props> {
  render(): React.ReactNode {
    const stamp = this.props.stamp;
    const shops = _.unique(stamp.shopItems.map((item) => item.shop));
    const color = shops.length !== 0 ? 'success' : 'secondary';
    return (
      <Dropdown className="w-100" as={ButtonGroup} align="end">
        <Button variant={color} href={stamp.page.href}>
          <ShoppingBasket fontSize={'small'} /> В магазин
        </Button>
        {shops.length !== 0 && <Dropdown.Toggle split variant={color} id="dropdown-split-basic" />}
        {shops.length !== 0 && (
          <Dropdown.Menu>
            {shops.map((shop) => (
              <Dropdown.Item key={shop.id} href={shop.link}>
                {shop.displayName}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        )}
      </Dropdown>
    );
  }
}

export class StampCard extends React.Component<Props, Record<string, never>> {
  render(): React.ReactNode {
    const s = this.props.stamp;
    return (
      <div className="position-relative shadow-sm bg-light border border-secondary rounded p-2">
        <div className="stamp-card-header mb-1 d-flex justify-content-between">
          <div>
            №{s.id} {s.value}₽ {s.year}
          </div>
          <div>
            <StampCardDropdown stamp={this.props.stamp} />
          </div>
        </div>
        <div className="stamp-card-image-container mb-1">
          <div className="stamp-card-image-container-dummy" />
          <img
            loading="lazy"
            draggable="false"
            alt={'Image of stamp ' + s.id}
            className="stamp-image"
            src={(s.imageUrl ?? EmptyImage).toString()}
          />
        </div>
        <ShopItemsDropdown stamp={s} />
      </div>
    );
  }
}
