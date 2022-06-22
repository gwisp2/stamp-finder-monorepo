import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import React from 'react';
import { Button } from 'react-bootstrap';
import { selectGroupedItemsForStamp } from 'state/api.slice';
import { Item, Shop } from 'state/api/shops';
import { Stamp } from 'state/api/stamps';
import { useAppSelector } from 'state/hooks';
import _ from 'underscore';
import { CardDisplayOptions } from './common';
import { useCloseablePopup } from './popup';
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

  const popup = useCloseablePopup(<ShopEntriesView stamp={stamp} entries={shopEntries} options={props.options} />);

  return (
    <div ref={popup.containerRef} {...popup.containerProps}>
      <Button
        ref={popup.setReferenceElement}
        target="_blank"
        href={stamp.page.toString()}
        variant={buttonColor}
        className="icon-with-text w-100"
      >
        <ShoppingBasket fontSize="small" /> <span className="ms-1">В магазин</span>
      </Button>
      {popup.elements}
    </div>
  );
};
