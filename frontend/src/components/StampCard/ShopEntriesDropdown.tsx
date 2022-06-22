import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import React, { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { usePopper } from 'react-popper';
import { selectGroupedItemsForStamp } from 'state/api.slice';
import { Item, Shop } from 'state/api/shops';
import { Stamp } from 'state/api/stamps';
import { useAppSelector } from 'state/hooks';
import _ from 'underscore';
import { CardDisplayOptions } from './common';
import { PopperContainer } from './PopperContainer';
import './StampCard.css';

type ShopEntry = [Shop, Item[]];

const ShopEntryView: React.VFC<{ entry: ShopEntry }> = (props) => {
  const [shop, items] = props.entry;
  return (
    <div>
      <strong className="d-inline-block me-2">{shop.displayName}</strong>
      {items.map((item) => item.name).join(', ')}
    </div>
  );
};

export const ShopEntriesView: React.VFC<{ stamp: Stamp; entries: ShopEntry[]; options: CardDisplayOptions }> = (
  props,
) => {
  const entries = props.entries;
  if (entries.length === 0) {
    return <>Нет в продаже</>;
  }

  // Partition entries into highlighed and others
  const highlightedShopIds = props.options.highlightedShops;
  const highlightedEntries =
    highlightedShopIds !== undefined ? entries.filter((p) => _.contains(highlightedShopIds, p[0].id)) : entries;
  const otherEntries = entries.filter((p) => !_.includes(highlightedEntries, p));

  return (
    <div>
      {highlightedEntries.map((entry) => (
        <ShopEntryView key={entry[0].id} entry={entry} />
      ))}
      {highlightedEntries.length !== 0 && otherEntries.length !== 0 && <hr />}
      {otherEntries.map((entry) => (
        <ShopEntryView key={entry[0].id} entry={entry} />
      ))}
    </div>
  );
};

export const ShopEntriesDropdown: React.VFC<{ stamp: Stamp; options: CardDisplayOptions }> = (props) => {
  const stamp = props.stamp;
  const shopEntries = useAppSelector(selectGroupedItemsForStamp(props.stamp));
  const buttonColor = shopEntries.length !== 0 ? 'success' : 'secondary';

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
        variant={buttonColor}
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
          <ShopEntriesView stamp={stamp} entries={shopEntries} options={props.options} />
        </PopperContainer>
      )}
    </>
  );
};
