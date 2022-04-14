import { StampCard } from 'components/StampCard';
import { SearchOptions, Stamp } from 'model';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

export interface StampListProps {
  stamps: Array<Stamp>;
  searchOptions?: SearchOptions;
}

export interface StampListState {
  allItems: Array<Stamp>;
  shownItems: Array<Stamp>;
}

export const StampList: React.VFC<StampListProps> = (props) => {
  const BatchSize = 20;
  const [shownItems, setShownItems] = useState(props.stamps.slice(0, BatchSize));

  // Reset shown items on props change
  useEffect(() => {
    setShownItems(props.stamps.slice(0, BatchSize));
  }, [props.stamps]);

  // Show more items when scrolled to end
  const showMoreItems = () => {
    const startIndex = shownItems.length;
    const endIndex = Math.min(props.stamps.length, shownItems.length + BatchSize);
    setShownItems(shownItems.concat(props.stamps.slice(startIndex, endIndex)));
  };

  return (
    <InfiniteScroll
      hasMore={shownItems.length !== props.stamps.length}
      loader={<h4 key="L">Загрузка...</h4>}
      loadMore={showMoreItems}
      className="row"
    >
      {shownItems.map((s) => {
        return (
          <div className="col-sm-6 col-md-4 col-xxl-3 mb-2" key={`S${s.id}`}>
            <StampCard stamp={s} searchOptions={props.searchOptions} />
          </div>
        );
      })}
    </InfiniteScroll>
  );
};
