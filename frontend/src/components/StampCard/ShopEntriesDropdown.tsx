import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import { Shop, ShopItem, Stamp } from 'model';
import React, { useCallback, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { usePopper } from 'react-popper';
import _ from 'underscore';
import { CardDisplayOptions } from './common';
import { PopperContainer } from './PopperContainer';
import './StampCard.css';

const ShopEntry: React.VFC<{ entry: [Shop, ShopItem[]] }> = (props) => {
  const [shop, items] = props.entry;
  return (
    <div>
      <strong className="d-inline-block me-2">{shop.displayName}</strong>
      {items.map((item) => item.name).join(', ')}
    </div>
  );
};

export const ShopEntries: React.VFC<{ stamp: Stamp; options: CardDisplayOptions }> = (props) => {
  if (!props.stamp.isSoldAnywhere()) {
    return <>Нет в продаже</>;
  }

  const entries = props.stamp.itemsGroupedByShops();
  const highlightedShops = props.options.highlightedShops;
  const highlightedEntries =
    highlightedShops !== undefined ? entries.filter((p) => _.contains(highlightedShops, p[0].id)) : entries;
  const otherEntries = entries.filter((p) => !_.includes(highlightedEntries, p));

  return (
    <div>
      {highlightedEntries.map((entry) => (
        <ShopEntry key={entry[0].id} entry={entry} />
      ))}
      {highlightedEntries.length !== 0 && otherEntries.length !== 0 && <Dropdown.Divider />}
      {otherEntries.map((entry) => (
        <ShopEntry key={entry[0].id} entry={entry} />
      ))}
    </div>
  );
};

export const ShopEntriesDropdown: React.VFC<{ stamp: Stamp; options: CardDisplayOptions }> = (props) => {
  const stamp = props.stamp;
  const color = stamp.shopItems.length !== 0 ? 'success' : 'secondary';

  const [isOpen, setOpen] = useState(false);
  const openPopup = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const { styles, attributes } = usePopper(referenceElement, popperElement);

  return (
    <>
      <Button
        ref={setReferenceElement}
        target="_blank"
        href={stamp.page.toString()}
        onTouchStart={openPopup}
        onClick={openPopup}
        onMouseEnter={openPopup}
        onMouseLeave={closePopup}
        variant={color}
        className="icon-with-text w-100"
      >
        <ShoppingBasket fontSize="small" /> <span className="ms-1">В магазин</span>
      </Button>
      {isOpen && (
        <PopperContainer
          ref={setPopperElement}
          onBlur={closePopup}
          onMouseEnter={openPopup}
          onMouseLeave={closePopup}
          style={styles.popper}
          {...attributes.popper}
        >
          <ShopEntries stamp={stamp} options={props.options} />
        </PopperContainer>
      )}
    </>
  );
};
