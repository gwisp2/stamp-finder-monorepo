import { Stamp } from 'api/SfDatabase';
import { CardDisplayOptions, StampCard } from 'components/StampCard';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import NoStampsImage from './icons/no-stamps.svg';

export interface StampListProps {
  stamps: Array<Stamp>;
  options: CardDisplayOptions;
}

export interface StampListState {
  allItems: Array<Stamp>;
  shownItems: Array<Stamp>;
}

const NoMessagesContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 400px;
  justify-content: center;
  align-items: center;
  font-size: 30px;

  img {
    width: 256px;
  }
`;

const NoStampsMessage: React.FC = () => {
  return (
    <NoMessagesContainerDiv>
      <img src={NoStampsImage} alt="" />
      <div>Ничего не найдено</div>
    </NoMessagesContainerDiv>
  );
};

export const StampList: React.FC<StampListProps> = React.memo((props) => {
  if (props.stamps.length === 0) {
    return <NoStampsMessage />;
  }

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
    >
      <div className="row">
        {shownItems.map((s) => {
          return (
            <div key={s.id} className="col-sm-6 col-md-4 col-xxl-3 mb-2">
              <StampCard stamp={s} options={props.options} />
            </div>
          );
        })}
      </div>
    </InfiniteScroll>
  );
});
StampList.displayName = 'StampList';
