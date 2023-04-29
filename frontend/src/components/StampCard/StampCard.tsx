import { Stamp } from 'api/SfDatabase';
import React from 'react';
import styled from 'styled-components';
import { CardDisplayOptions } from './CardDisplayOptions';
import EmptyImage from './empty.png';
import { ShopEntriesDropdown } from './ShopEntriesDropdown';
import './StampCard.css';
import { StampInfoDropdown } from './StampInfoDropdown';

const StampCardHeader: React.FC<{ stamp: Stamp }> = (props) => {
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
const SquareImage: React.FC<{ alt: string; url: string | null; className: string }> = (props) => {
  return (
    <div className={`ratio ratio-1x1 ${props.className}`}>
      <FillParentImage
        loading="eager"
        draggable="false"
        alt={props.alt}
        className="stamp-image"
        src={props.url ?? EmptyImage}
      />
    </div>
  );
};

export const StampCard: React.FC<{ stamp: Stamp; options: CardDisplayOptions }> = React.memo((props) => {
  const s = props.stamp;
  return (
    <div className="position-relative shadow-sm bg-light border border-secondary rounded p-2">
      <StampCardHeader stamp={s} />
      <SquareImage alt={'Image of stamp ' + s.id} url={s.imageUrl} className="mb-1" />
      <ShopEntriesDropdown stamp={s} options={props.options} />
    </div>
  );
});
StampCard.displayName = 'StampCard';
