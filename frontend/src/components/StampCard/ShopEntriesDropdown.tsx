import ShoppingBasket from '@mui/icons-material/ShoppingBasket';
import { ItemGroup, Stamp } from 'api/SfDatabase';
import _ from 'lodash';
import React from 'react';
import { Button } from 'react-bootstrap';
import { CardDisplayOptions } from './CardDisplayOptions';
import { useCloseablePopup } from './popup';
import './StampCard.css';

const ShopEntryView: React.FC<{ entry: ItemGroup }> = (props) => {
  const { shop, items } = props.entry;
  return (
    <div>
      <strong className="d-inline-block me-2">{shop.displayName}</strong>
      {items.map((item) => item.name).join(', ')}
    </div>
  );
};

export const ShopEntriesView: React.FC<{ stamp: Stamp; entries: ItemGroup[]; options: CardDisplayOptions }> = (
  props,
) => {
  const entries = props.entries;
  if (entries.length === 0) {
    return <>Нет в продаже</>;
  }

  // Partition entries into highlighed and others
  const highlightedShopIds = props.options.highlightedShops;
  const highlightedEntries =
    highlightedShopIds !== undefined ? entries.filter((p) => _.includes(highlightedShopIds, p.shop.id)) : entries;
  const otherEntries = entries.filter((p) => !_.includes(highlightedEntries, p));

  return (
    <div>
      {highlightedEntries.map((entry) => (
        <ShopEntryView key={entry.shop.id} entry={entry} />
      ))}
      {highlightedEntries.length !== 0 && otherEntries.length !== 0 && <hr />}
      {otherEntries.map((entry) => (
        <ShopEntryView key={entry.shop.id} entry={entry} />
      ))}
    </div>
  );
};

export const ShopEntriesDropdown: React.FC<{ stamp: Stamp; options: CardDisplayOptions }> = (props) => {
  const stamp = props.stamp;
  const shopEntries = stamp.shopItemGroups;
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
